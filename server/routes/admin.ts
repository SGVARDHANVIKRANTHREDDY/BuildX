import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getAdminRecord, getOrders, getMenuItems, saveMenuItems, updateOrderStatusInWb } from '../utils/excelHandler.js';
import { withWriteLock } from '../utils/writeLock.js';
import { getTodayDateString } from '../utils/tokenGenerator.js';
import { authAdminMiddleware, AdminAuthRequest } from '../middleware/authAdmin.js';
import { createRateLimiter } from '../middleware/rateLimit.js';
import { logger } from '../utils/logger.js';
import { OrderStatus, MenuItem } from '../types/index.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'canteen_super_secret_jwt_key_2026';
const TOKEN_EXPIRY = '45m';

const loginRateLimit = createRateLimiter(15 * 60 * 1000, 15, 'Too many login attempts. Please try again later.');


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

    logger.info('Admin logged in successfully', { username: admin.username });

    res.json({
      success: true,
      token,
      expiresIn: TOKEN_EXPIRY,
      user: { username: admin.username }
    });
  } catch (error) {
    logger.error('Admin login error', { error: String(error) });
    res.status(500).json({ success: false, error: 'Authentication failed' });
  }
});


router.post('/refresh', authAdminMiddleware, (req: AdminAuthRequest, res) => {
  try {
    const username = req.adminUser?.username || 'svce';
    const newToken = jwt.sign({ username }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
    res.json({
      success: true,
      token: newToken,
      expiresIn: TOKEN_EXPIRY
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Token refresh failed' });
  }
});


router.get('/orders', authAdminMiddleware, (req, res) => {
  try {
    const today = getTodayDateString();
    const allOrders = getOrders();

    const mapped = allOrders.map(o => {
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

    const todayOrders = mapped.filter(o => o.date === today);
    const activeCount = todayOrders.filter(o => o.order_status === 'PLACED' || o.order_status === 'PREPARING').length;
    const readyCount = todayOrders.filter(o => o.order_status === 'READY').length;
    const servedCount = todayOrders.filter(o => o.order_status === 'SERVED').length;
    const totalRevenue = todayOrders.reduce((sum, o) => sum + (o.payment_status === 'PAID' ? o.total_amount : 0), 0);

    res.json({
      success: true,
      orders: mapped,
      stats: {
        totalOrders: todayOrders.length,
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

    const updated = await withWriteLock(async (lockedWb) => {
      return updateOrderStatusInWb(tokenId, status, lockedWb);
    });

    if (!updated) {
      return res.status(404).json({ success: false, error: `Order #${tokenId} not found` });
    }

    logger.info('Admin updated order status', { tokenId, status });

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

    const result = await withWriteLock(async (lockedWb) => {
      const items = getMenuItems(lockedWb);

      
      const usedNumbers = items
        .map(i => {
          const match = /^ITM(\d+)$/.exec(i.item_id);
          return match ? parseInt(match[1], 10) : 0;
        })
        .filter(n => Number.isFinite(n));
      const nextNumber = (usedNumbers.length > 0 ? Math.max(...usedNumbers) : 0) + 1;
      const newItemId = `ITM${String(nextNumber).padStart(3, '0')}`;

      const duplicate = items.find(i => i.name.trim().toLowerCase() === name.trim().toLowerCase());
      if (duplicate) {
        throw new Error(`An item named "${name.trim()}" already exists (${duplicate.item_id})`);
      }

      const newItem: MenuItem = {
        item_id: newItemId,
        name: name.trim(),
        category: category.trim(),
        price: parsedPrice,
        available: true
      };

      items.push(newItem);
      saveMenuItems(items, lockedWb);
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

    const result = await withWriteLock(async (lockedWb) => {
      const items = getMenuItems(lockedWb);
      const target = items.find(i => i.item_id === item_id);
      if (!target) {
        throw new Error(`Menu item ${item_id} not found`);
      }

      if (typeof available === 'boolean') {
        target.available = available;
        if (available) {
          target.restock_note = undefined;
        }
      }
      if (typeof price === 'number' && price > 0) {
        target.price = price;
      }
      if (name && typeof name === 'string') {
        target.name = name;
      }
      if (typeof restock_note === 'string') {
        target.restock_note = restock_note.trim() ? restock_note.trim() : undefined;
      }

      saveMenuItems(items, lockedWb);
      return target;
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
