import { Router } from 'express';
import { getMenuItems, getOrdersForDate } from '../utils/db.js';
import { getTodayDateString } from '../utils/tokenGenerator.js';
import { logger } from '../utils/logger.js';

const router = Router();

router.get('/', (req, res) => {
  try {
    const items = getMenuItems();
    const today = getTodayDateString();
    const todaysOrders = getOrdersForDate(today);

    const activeOrders = todaysOrders.filter(o => o.order_status === 'PLACED' || o.order_status === 'PREPARING');
    const queueDepth = activeOrders.length;
    const estimatedWaitMinutes = Math.max(5, Math.min(45, Math.round(queueDepth * 3.5) + 5));

    res.json({
      success: true,
      items,
      queueInfo: {
        queueDepth,
        estimatedWaitMinutes,
        activeOrdersCount: activeOrders.length
      }
    });
  } catch (error) {
    logger.error('Failed to fetch menu items', { error: String(error) });
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve menu. Please try again.'
    });
  }
});

export default router;
