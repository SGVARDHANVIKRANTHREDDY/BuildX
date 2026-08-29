import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  getAdminRecord,
  getOrdersForDate,
  insertMenuItem,
  updateMenuItem,
  getNextMenuItemId,
  findMenuItemByName,
  updateOrderStatus,
  updateAdminPassword,
  getOrderHistoryPaginated
} from '../utils/db.js';
import { withWriteLock } from '../utils/writeLock.js';
import { getTodayDateString } from '../utils/tokenGenerator.js';
import { authAdminMiddleware, AdminAuthRequest } from '../middleware/authAdmin.js';
import { createRateLimiter } from '../middleware/rateLimit.js';
import { logger } from '../utils/logger.js';
import { OrderStatus } from '../types/index.js';
import { JWT_SECRET } from '../config/secrets.js';
import { notifyOrderReady } from '../utils/pushSender.js';
import { setAdminSessionCookie, clearAdminSessionCookie } from '../utils/cookies.js';

const router = Router();
const TOKEN_EXPIRY = '45m';
const TOKEN_EXPIRY_SECONDS = 45 * 60;

const loginRateLimit = createRateLimiter(15 * 60 * 1000, 15, 'Too many login attempts. Please try again later.');
const changePasswordRateLimit = createRateLimiter(15 * 60 * 1000, 10, 'Too many password change attempts. Please try again later.');

router.post('/login', loginRateLimit, async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username and password are required' });
    }

    const admin = getAdminRecord(username);
    if (!admin) {
      logger.warn('Admin login failed: user not found', { username });
      return res.status(401).json({ success: false, error: 'Invalid username or password' });
    }

    const isMatch = bcrypt.compareSync(password, admin.password_hash);
    if (!isMatch) {
      logger.warn('Admin login failed: incorrect password', { username });
      return res.status(401).json({ success: false, error: 'Invalid username or password' });
    }

    const token = jwt.sign({ username: admin.username }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
    setAdminSessionCookie(req, res, token, TOKEN_EXPIRY_SECONDS);

    logger.info('Admin logged in successfully', { username: admin.username });

    res.json({
      success: true,
      expiresIn: TOKEN_EXPIRY,
      user: { username: admin.username }
    });
  } catch (error) {
    logger.error('Admin login error', { error: String(error) });
    res.status(500).json({ success: false, error: 'Authentication failed' });
  }
});

router.get('/session', authAdminMiddleware, (req: AdminAuthRequest, res) => {
  res.json({ success: true, user: { username: req.adminUser?.username } });
});

router.post('/logout', (req, res) => {
  clearAdminSessionCookie(res);
  res.json({ success: true });
});

router.post('/refresh', authAdminMiddleware, (req: AdminAuthRequest, res) => {
  try {
    const username = req.adminUser?.username || 'admin';
    const newToken = jwt.sign({ username }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
    setAdminSessionCookie(req, res, newToken, TOKEN_EXPIRY_SECONDS);
    res.json({
      success: true,
      expiresIn: TOKEN_EXPIRY
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Token refresh failed' });
  }
});

router.post('/change-password', changePasswordRateLimit, authAdminMiddleware, async (req: AdminAuthRequest, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const username = req.adminUser!.username;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: 'Current and new password are required' });
    }
    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      return res.status(400).json({ success: false, error: 'New password must be at least 8 characters' });
    }
    if (newPassword === currentPassword) {
      return res.status(400).json({ success: false, error: 'New password must be different from the current password' });
    }

    const admin = getAdminRecord(username);
    if (!admin || !bcrypt.compareSync(currentPassword, admin.password_hash)) {
      logger.warn('Admin password change rejected: current password mismatch', { username });
      return res.status(401).json({ success: false, error: 'Current password is incorrect' });
    }

    const newHash = bcrypt.hashSync(newPassword, 10);
    const updated = await withWriteLock(() => updateAdminPassword(username, newHash));

    if (!updated) {
      return res.status(500).json({ success: false, error: 'Could not update password' });
    }

    logger.info('Admin password changed', { username });
    res.json({ success: true });
  } catch (error) {
    logger.error('Admin password change error', { error: String(error) });
    res.status(500).json({ success: false, error: 'Failed to change password' });
  }
});

router.get('/orders', authAdminMiddleware, (req, res) => {
  try {
    const today = getTodayDateString();
    const todayOrders = getOrdersForDate(today);

    const mapped = todayOrders.map(o => {
      let parsedItems = [];
      try {
        parsedItems = JSON.parse(o.items || '[]');
      } catch {
        parsedItems = [];
      }
      return {
        ...o,
        items: parsedItems
      };
    });

    mapped.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const activeCount = mapped.filter(o => o.order_status === 'PLACED' || o.order_status === 'PREPARING').length;
    const readyCount = mapped.filter(o => o.order_status === 'READY').length;
    const servedCount = mapped.filter(o => o.order_status === 'SERVED').length;
    const totalRevenue = mapped.reduce((sum, o) => sum + (o.payment_status === 'PAID' ? o.total_amount : 0), 0);

    res.json({
      success: true,
      orders: mapped,
      stats: {
        totalOrders: mapped.length,
        activeCount,
        readyCount,
        servedCount,
        totalRevenue,
        avgWaitMinutes: activeCount > 0 ? (activeCount * 3.2).toFixed(1) : '0.0'
      }
    });
  } catch (error) {
    logger.error('Admin failed to fetch orders', { error: String(error) });
    res.status(500).json({ success: false, error: 'Failed to fetch orders queue' });
  }
});

router.get('/orders/history', authAdminMiddleware, (req, res) => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(String(req.query.pageSize ?? '25'), 10) || 25));

    const { orders, total } = getOrderHistoryPaginated(page, pageSize);

    const mapped = orders.map(o => {
      let parsedItems = [];
      try {
        parsedItems = JSON.parse(o.items || '[]');
      } catch {
        parsedItems = [];
      }
      return { ...o, items: parsedItems };
    });

    res.json({
      success: true,
      orders: mapped,
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize))
    });
  } catch (error) {
    logger.error('Admin failed to fetch order history', { error: String(error) });
    res.status(500).json({ success: false, error: 'Failed to fetch order history' });
  }
});

router.patch('/orders/:token_id/status', authAdminMiddleware, async (req, res) => {
  try {
    const tokenId = req.params.token_id;
    const { status } = req.body as { status: OrderStatus };

    const validStatuses: OrderStatus[] = ['PLACED', 'PREPARING', 'READY', 'SERVED'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const today = getTodayDateString();
    const updated = await withWriteLock(() => updateOrderStatus(tokenId, status, today));

    if (!updated) {
      return res.status(404).json({ success: false, error: `Order #${tokenId} not found` });
    }

    logger.info('Admin updated order status', { tokenId, status });

    if (status === 'READY') {
      notifyOrderReady(tokenId).catch(err =>
        logger.error('push notify (order ready) failed', { tokenId, error: String(err) })
      );
    }

    res.json({
      success: true,
      token_id: tokenId,
      new_status: status
    });
  } catch (error) {
    logger.error('Failed to update order status', { error: String(error) });
    res.status(500).json({ success: false, error: 'Could not update order status' });
  }
});

router.post('/menu', authAdminMiddleware, async (req, res) => {
  try {
    const { name, category, price } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Item name is required' });
    }
    if (!category || typeof category !== 'string' || !category.trim()) {
      return res.status(400).json({ success: false, error: 'Category is required' });
    }
    const parsedPrice = Number(price);
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({ success: false, error: 'Price must be a positive number' });
    }

    const result = await withWriteLock(() => {
      const duplicate = findMenuItemByName(name);
      if (duplicate) {
        throw new Error(`An item named "${name.trim()}" already exists (${duplicate.item_id})`);
      }

      const newItem = {
        item_id: getNextMenuItemId(),
        name: name.trim(),
        category: category.trim(),
        price: parsedPrice,
        available: true
      };

      insertMenuItem(newItem);
      return newItem;
    });

    logger.info('Admin added new menu item', { item: result });

    res.json({
      success: true,
      item: result
    });
  } catch (error: any) {
    logger.error('Failed to add menu item', { error: error.message || String(error) });
    res.status(400).json({ success: false, error: error.message || 'Failed to add menu item' });
  }
});

router.put('/menu', authAdminMiddleware, async (req, res) => {
  try {
    const { item_id, available, price, name, restock_note } = req.body;
    if (!item_id) {
      return res.status(400).json({ success: false, error: 'item_id is required' });
    }

    const result = await withWriteLock(() => {
      const patch: Parameters<typeof updateMenuItem>[1] = {};
      if (typeof available === 'boolean') patch.available = available;
      if (typeof price === 'number' && price > 0) patch.price = price;
      if (name && typeof name === 'string') patch.name = name;
      if (typeof restock_note === 'string') patch.restock_note = restock_note.trim();

      const updated = updateMenuItem(item_id, patch);
      if (!updated) {
        throw new Error(`Menu item ${item_id} not found`);
      }
      return updated;
    });

    logger.info('Admin updated menu item', { item_id, updated: result });

    res.json({
      success: true,
      item: result
    });
  } catch (error: any) {
    logger.error('Failed to update menu item', { error: error.message || String(error) });
    res.status(500).json({ success: false, error: error.message || 'Failed to update menu' });
  }
});

export default router;
