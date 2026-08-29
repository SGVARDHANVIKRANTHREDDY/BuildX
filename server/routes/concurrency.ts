import { Router } from 'express';
import { getMenuItems, updateMenuItem, addOrder } from '../utils/db.js';
import { withWriteLock } from '../utils/writeLock.js';
import { generateToken, getTodayDateString } from '../utils/tokenGenerator.js';
import { createRateLimiter } from '../middleware/rateLimit.js';
import { logger } from '../utils/logger.js';
import { OrderRecord } from '../types/index.js';
import { tryDecodeAdmin } from '../utils/cookies.js';

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

const simRateLimit = createRateLimiter(60 * 1000, 8, 'Concurrency test rate limited. Please wait 1 minute before re-running.');

router.post('/simulate', simRateLimit, async (req, res) => {
  const decoded = tryDecodeAdmin(req);
  const callerAdmin: string | null = decoded?.username || null;

  const isProduction = process.env.NODE_ENV === 'production';
  const explicitlyAllowed = process.env.ALLOW_DEMO_CONCURRENCY === 'true';
  if (isProduction && !callerAdmin && !explicitlyAllowed) {
    logger.warn('unauthorized concurrency simulator attempt blocked in production');
    return res.status(403).json({
      success: false,
      error: 'Concurrency simulation is restricted to authenticated administrators in production. Set ALLOW_DEMO_CONCURRENCY=true to keep it public on a demo deployment.'
    });
  }

  const count = Math.min(20, Math.max(2, Number(req.body.count) || 5));
  const itemId = req.body.item_id || 'ITM001';
  const mode = req.body.mode || 'standard';

  logger.info('running concurrency demo', { count, itemId, mode, callerAdmin: callerAdmin || 'demo_client' });

  if (mode === 'last_unit') {
    await withWriteLock(() => {
      updateMenuItem(itemId, { available: true });
    });
  }

  const startTime = Date.now();

  const testPromises: Promise<SimResult>[] = Array.from({ length: count }).map(async (_, idx): Promise<SimResult> => {
    const paymentId = `sim_pay_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`;
    const studentName = `Student_${idx + 1}`;

    try {
      const result = await withWriteLock<SimResult>(() => {
        const menu = getMenuItems();
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
          updateMenuItem(itemId, { available: false });
        }

        const today = getTodayDateString();
        const tokenId = generateToken(today);

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

        addOrder(orderRecord);

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
