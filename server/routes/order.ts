import { Router } from 'express';
import { getOrders } from '../utils/excelHandler.js';
import { getTodayDateString } from '../utils/tokenGenerator.js';
import { logger } from '../utils/logger.js';

const router = Router();

router.get('/track/:token_id', (req, res) => {
  try {
    const tokenId = req.params.token_id.trim();
    if (!tokenId) {
      return res.status(400).json({ success: false, error: 'Token ID is required' });
    }

    const today = getTodayDateString();
    const orders = getOrders();

    const order = orders.find(o => String(o.token_id) === tokenId && o.date === today);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: `Order with Token #${tokenId} for today (${today}) was not found. Please verify the 4-digit token.`
      });
    }

    
    const currentTokenNum = Number(order.token_id);
    const activeOrdersAhead = orders.filter(o => {
      if (o.date !== today) return false;
      if (o.order_status !== 'PLACED' && o.order_status !== 'PREPARING') return false;
      const otherTokenNum = Number(o.token_id);
      if (!isNaN(currentTokenNum) && !isNaN(otherTokenNum)) {
        return otherTokenNum < currentTokenNum;
      }
      return new Date(o.timestamp).getTime() < new Date(order.timestamp).getTime();
    });

    const ordersAhead = activeOrdersAhead.length;
    const estimatedMinutesRemaining = order.order_status === 'READY' || order.order_status === 'SERVED'
      ? 0
      : Math.max(1, ordersAhead * 3 + (order.order_status === 'PREPARING' ? 2 : 4));

    let parsedItems = [];
    try {
      parsedItems = JSON.parse(order.items || '[]');
    } catch {
      parsedItems = [];
    }

    logger.info('order tracked', { tokenId, date: today, status: order.order_status, ordersAhead });

    res.json({
      success: true,
      order: {
        token_id: order.token_id,
        date: order.date || today,
        items: parsedItems,
        total_amount: order.total_amount,
        order_status: order.order_status,
        payment_status: order.payment_status,
        timestamp: order.timestamp,
        ordersAhead,
        estimatedMinutesRemaining
      }
    });
  } catch (error) {
    logger.error('Error tracking order', { error: String(error) });
    res.status(500).json({ success: false, error: 'Failed to retrieve order status' });
  }
});

export default router;
