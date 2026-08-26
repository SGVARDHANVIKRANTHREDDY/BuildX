import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { getMenuItems, saveMenuItems, getOrders, addOrder } from '../utils/excelHandler.js';
import { withWriteLock } from '../utils/writeLock.js';
import { generateToken, getTodayDateString } from '../utils/tokenGenerator.js';
import { createRateLimiter } from '../middleware/rateLimit.js';
import { logger } from '../utils/logger.js';
import { OrderRecord } from '../types/index.js';

interface SimResult {
  taskId: number;
  studentName: string;
  success: boolean;
  tokenId?: string;
  item?: string;
  paymentId?: string;
  error?: string;
}

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'canteen_super_secret_jwt_key_2026';

const simRateLimit = createRateLimiter(60 * 1000, 8, 'Concurrency test rate limited. Please wait 1 minute before re-running.');


router.post('/simulate', simRateLimit, async (req, res) => {
  const authHeader = req.headers.authorization;
  let callerAdmin: string | null = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET) as { username: string };
      callerAdmin = decoded.username;
    } catch {
      
    }
  }

  if (process.env.ALLOW_DEMO_CONCURRENCY === 'false' && !callerAdmin) {
    logger.warn('unauthorized concurrency simulator attempt in locked mode');
    return res.status(403).json({
      success: false,
      error: 'Concurrency simulation is restricted to authenticated administrators in locked mode.'
    });
  }

  const count = Math.min(20, Math.max(2, Number(req.body.count) || 5));
  const itemId = req.body.item_id || 'ITM001';
  const mode = req.body.mode || 'standard'; 

  logger.info('running concurrency demo', { count, itemId, mode, callerAdmin: callerAdmin || 'demo_client' });

  if (mode === 'last_unit') {
    await withWriteLock(async (wb) => {
      const menu = getMenuItems(wb);
      const target = menu.find(m => m.item_id === itemId);
      if (target) {
        target.available = true;
        saveMenuItems(menu, wb);
      }
    });
  }

  const startTime = Date.now();
  let firstOrderClaimed = false;

  const testPromises: Promise<SimResult>[] = Array.from({ length: count }).map(async (_, idx): Promise<SimResult> => {
    const paymentId = `sim_pay_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`;
    const studentName = `Student_${idx + 1}`;

    try {
      const result = await withWriteLock<SimResult>(async (lockedWb) => {
        const menu = getMenuItems(lockedWb);
        const item = menu.find(m => m.item_id === itemId);

        if (!item || !item.available) {
          return {
            taskId: idx + 1,
            studentName,
            success: false,
            error: `Item "${item ? item.name : itemId}" sold out during atomic inventory check`
          };
        }

        
        if (mode === 'last_unit') {
          item.available = false;
          saveMenuItems(menu, lockedWb);
        }

        const today = getTodayDateString();
        const tokenId = generateToken(lockedWb, today);

        const orderRecord: OrderRecord = {
          token_id: tokenId,
          date: today,
          items: JSON.stringify([{ item_id: item.item_id, name: item.name, price: item.price, qty: 1 }]),
          total_amount: item.price,
          payment_id: paymentId,
          payment_status: 'PAID',
          order_status: 'PLACED',
          timestamp: new Date().toISOString()
        };

        addOrder(orderRecord, lockedWb);

        return {
          taskId: idx + 1,
          studentName,
          success: true,
          tokenId,
          item: item.name,
          paymentId
        };
      });

      return result;
    } catch (err: any) {
      return {
        taskId: idx + 1,
        studentName,
        success: false,
        error: err.message || 'Write lock failed'
      };
    }
  });

  const results = await Promise.all(testPromises);
  const totalDurationMs = Date.now() - startTime;

  const successfulTokens = results.filter(r => r.success && r.tokenId).map(r => r.tokenId as string);
  const rejectedCount = results.filter(r => !r.success).length;
  const uniqueTokens = new Set(successfulTokens);
  const hasZeroCollisions = uniqueTokens.size === successfulTokens.length;

  res.json({
    success: true,
    mode,
    totalAttempted: count,
    totalSuccessful: successfulTokens.length,
    totalRejected: rejectedCount,
    uniqueTokensCount: uniqueTokens.size,
    zeroCollisionsVerified: hasZeroCollisions,
    expectedOutcomeMet: mode === 'last_unit' ? (successfulTokens.length === 1 && rejectedCount === count - 1) : hasZeroCollisions,
    durationMs: totalDurationMs,
    avgLatencyPerOrderMs: (totalDurationMs / count).toFixed(1),
    tokens: successfulTokens,
    detailedLogs: results
  });
});

export default router;
