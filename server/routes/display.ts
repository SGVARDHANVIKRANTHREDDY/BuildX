import { Router } from 'express';
import { getOrders } from '../utils/excelHandler.js';
import { getTodayDateString } from '../utils/tokenGenerator.js';
import { logger } from '../utils/logger.js';

const router = Router();

router.get('/now-serving', (req, res) => {
  try {
    const today = getTodayDateString();
    const orders = getOrders();

    const todayOrders = orders.filter(o => o.date === today);

    const preparing = todayOrders
      .filter(o => o.order_status === 'PREPARING')
      .map(o => o.token_id)
      .slice(-12);

    const ready = todayOrders
      .filter(o => o.order_status === 'READY')
      .map(o => o.token_id)
      .slice(-12);

    const recentlyServed = todayOrders
      .filter(o => o.order_status === 'SERVED')
      .map(o => o.token_id)
      .slice(-6);

    const totalActive = todayOrders.filter(o => o.order_status === 'PLACED' || o.order_status === 'PREPARING').length;

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      date: today,
      stats: {
        totalActive,
        readyCount: ready.length,
        preparingCount: preparing.length
      },
      tokens: {
        ready,
        preparing,
        recentlyServed
      }
    });
  } catch (error) {
    logger.error('Failed to get now-serving display data', { error: String(error) });
    res.status(500).json({ success: false, error: 'Failed to retrieve display feed' });
  }
});

export default router;
