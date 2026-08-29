import { Router } from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { getMenuItems, getOrderByPaymentId, getOrdersForDate, addOrder } from '../utils/db.js';
import { withWriteLock } from '../utils/writeLock.js';
import { generateToken, getTodayDateString } from '../utils/tokenGenerator.js';
import { validateCartItems } from '../middleware/validate.js';
import { createRateLimiter } from '../middleware/rateLimit.js';
import { logger } from '../utils/logger.js';
import { OrderItem, OrderRecord } from '../types/index.js';
import { notifyAdminNewOrder } from '../utils/pushSender.js';

const router = Router();

const DEMO_KEY_ID = 'rzp_test_sampleKey123';
const DEMO_KEY_SECRET = 'sampleSecretKey123456';

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || DEMO_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || DEMO_KEY_SECRET;

const IS_LIVE_MODE = RAZORPAY_KEY_ID !== DEMO_KEY_ID && RAZORPAY_KEY_SECRET !== DEMO_KEY_SECRET;

const razorpayClient = IS_LIVE_MODE
  ? new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET })
  : null;

if (IS_LIVE_MODE) {
  logger.info('razorpay live mode enabled', { key_id: RAZORPAY_KEY_ID.slice(0, 12) + '…' });
} else {
  logger.info('razorpay running in sandbox mode - set real keys in .env to go live');
}

const paymentRateLimit = createRateLimiter(60 * 1000, 300, 'Too many payment attempts. Please wait a moment.');

interface PendingOrder {
  items: OrderItem[];
  amount: number;
  createdAt: number;
}
const pendingOrdersMap = new Map<string, PendingOrder>();

setInterval(() => {
  const cutoff = Date.now() - 30 * 60 * 1000;
  for (const [orderId, data] of pendingOrdersMap.entries()) {
    if (data.createdAt < cutoff) {
      pendingOrdersMap.delete(orderId);
    }
  }
}, 5 * 60 * 1000);

function computeRazorpaySignature(orderId: string, paymentId: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
}

router.get('/config', (req, res) => {
  res.json({
    success: true,
    liveMode: IS_LIVE_MODE,
    key_id: RAZORPAY_KEY_ID
  });
});

router.post('/create-order', paymentRateLimit, validateCartItems, async (req, res) => {
  try {
    const { items } = req.body as { items: OrderItem[] };
    const menuItems = getMenuItems();

    let calculatedTotal = 0;
    const validatedItems: OrderItem[] = [];

    for (const orderItem of items) {
      const menuItem = menuItems.find(m => m.item_id === orderItem.item_id);
      if (!menuItem) {
        return res.status(400).json({
          success: false,
          error: `Item with ID ${orderItem.item_id} was not found on the menu.`
        });
      }
      if (!menuItem.available) {
        return res.status(400).json({
          success: false,
          error: `Item "${menuItem.name}" is currently sold out / unavailable.`
        });
      }

      calculatedTotal += menuItem.price * orderItem.qty;
      validatedItems.push({
        item_id: menuItem.item_id,
        name: menuItem.name,
        price: menuItem.price,
        qty: orderItem.qty
      });
    }

    if (calculatedTotal <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Order total must be greater than zero.'
      });
    }

    let razorpayOrderId: string;
    let responseAmountPaise = Math.round(calculatedTotal * 100);

    if (IS_LIVE_MODE && razorpayClient) {
      try {
        const liveOrder = await razorpayClient.orders.create({
          amount: responseAmountPaise,
          currency: 'INR',
          receipt: `canteen_${Date.now()}`,
          notes: { itemCount: String(validatedItems.length) }
        });
        razorpayOrderId = liveOrder.id;
        logger.info('razorpay order created', { razorpayOrderId, amount: calculatedTotal });
      } catch (gatewayError: any) {
        logger.error('razorpay order creation failed', { error: gatewayError.message || String(gatewayError) });
        return res.status(502).json({
          success: false,
          error: 'Could not reach the payment gateway. Please try again in a moment.'
        });
      }
    } else {
      razorpayOrderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    }

    pendingOrdersMap.set(razorpayOrderId, {
      items: validatedItems,
      amount: calculatedTotal,
      createdAt: Date.now()
    });

    logger.info(`order amount locked (${IS_LIVE_MODE ? 'live' : 'test'})`, {
      razorpayOrderId,
      amount: calculatedTotal,
      itemCount: validatedItems.length
    });

    res.json({
      success: true,
      liveMode: IS_LIVE_MODE,
      order_id: razorpayOrderId,
      amount: calculatedTotal,
      amountPaise: responseAmountPaise,
      currency: 'INR',
      key_id: RAZORPAY_KEY_ID,
      items: validatedItems,

      mockSecret: IS_LIVE_MODE ? undefined : RAZORPAY_KEY_SECRET
    });
  } catch (error) {
    logger.error('Failed to create payment order', { error: String(error) });
    res.status(500).json({ success: false, error: 'Could not initialize payment order' });
  }
});

router.post('/verify', paymentRateLimit, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      logger.warn('payment verify rejected: missing fields', { body: req.body });
      return res.status(400).json({
        success: false,
        error: 'Incomplete payment verification payload.'
      });
    }

    const expectedSignature = computeRazorpaySignature(razorpay_order_id, razorpay_payment_id, RAZORPAY_KEY_SECRET);

    const isSignatureValid = IS_LIVE_MODE
      ? razorpay_signature === expectedSignature
      : (razorpay_signature === expectedSignature) ||
        (razorpay_payment_id.startsWith('pay_test_') && razorpay_signature.length >= 10);

    if (!isSignatureValid) {
      logger.warn('payment signature mismatch, rejecting', {
        razorpay_order_id,
        razorpay_payment_id,
        mode: IS_LIVE_MODE ? 'live' : 'test'
      });
      return res.status(400).json({
        success: false,
        error: 'Invalid payment signature. Payment could not be verified server-side.'
      });
    }

    const pendingOrder = pendingOrdersMap.get(razorpay_order_id);
    let authoritativeItems: OrderItem[] = [];
    let authoritativeAmount = 0;

    if (pendingOrder) {
      authoritativeItems = pendingOrder.items;
      authoritativeAmount = pendingOrder.amount;
    } else if (Array.isArray(req.body.items) && req.body.items.length > 0) {

      const currentMenu = getMenuItems();
      for (const item of req.body.items) {
        const menuItem = currentMenu.find(m => m.item_id === item.item_id);
        if (!menuItem) {
          return res.status(400).json({ success: false, error: `Invalid item ${item.item_id}` });
        }
        authoritativeAmount += menuItem.price * (item.qty || 1);
        authoritativeItems.push({
          item_id: menuItem.item_id,
          name: menuItem.name,
          price: menuItem.price,
          qty: item.qty || 1
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        error: 'Original order metadata not found or expired. Please re-create order.'
      });
    }

    const duplicateOrder = getOrderByPaymentId(razorpay_payment_id);
    if (duplicateOrder) {
      logger.info('duplicate payment_id, returning existing order', {
        payment_id: razorpay_payment_id,
        token_id: duplicateOrder.token_id
      });
      return res.json({
        success: true,
        isExisting: true,
        token_id: duplicateOrder.token_id,
        order_status: duplicateOrder.order_status,
        total_amount: duplicateOrder.total_amount,
        items: JSON.parse(duplicateOrder.items || '[]'),
        timestamp: duplicateOrder.timestamp
      });
    }

    const result = await withWriteLock(() => {
      const currentMenu = getMenuItems();

      for (const reqItem of authoritativeItems) {
        const menuItem = currentMenu.find(m => m.item_id === reqItem.item_id);
        if (!menuItem || !menuItem.available) {
          throw new Error(`Item "${menuItem ? menuItem.name : reqItem.item_id}" was sold out while checking out.`);
        }
      }

      const today = getTodayDateString();
      const tokenId = generateToken(today);

      const newOrderRecord: OrderRecord = {
        token_id: tokenId,
        date: today,
        items: JSON.stringify(authoritativeItems),
        total_amount: authoritativeAmount,
        payment_id: razorpay_payment_id,
        payment_status: 'PAID',
        order_status: 'PLACED',
        timestamp: new Date().toISOString()
      };

      addOrder(newOrderRecord);
      pendingOrdersMap.delete(razorpay_order_id);

      return {
        tokenId,
        order: newOrderRecord
      };
    });

    logger.info('order placed', {
      token_id: result.tokenId,
      payment_id: razorpay_payment_id,
      amount: result.order.total_amount
    });

    notifyAdminNewOrder(result.tokenId, authoritativeItems.length).catch(err =>
      logger.error('push notify (new order) failed', { tokenId: result.tokenId, error: String(err) })
    );

    const today = getTodayDateString();
    const activeOrders = getOrdersForDate(today).filter(o => o.order_status === 'PLACED' || o.order_status === 'PREPARING');
    const estimatedWaitMinutes = Math.max(5, Math.min(45, (activeOrders.length + 1) * 3));

    res.json({
      success: true,
      token_id: result.tokenId,
      order_status: result.order.order_status,
      total_amount: result.order.total_amount,
      items: JSON.parse(result.order.items),
      timestamp: result.order.timestamp,
      estimatedWaitMinutes
    });
  } catch (error: any) {
    logger.error('Payment verification / order creation failed', { error: error.message || String(error) });
    res.status(400).json({
      success: false,
      error: error.message || 'Payment verification failed'
    });
  }
});

export default router;
