import { Router } from 'express';
import { VAPID_PUBLIC_KEY } from '../config/vapid.js';
import { saveSubscription, replaceSubscriptionEndpoint } from '../utils/pushStore.js';
import { authAdminMiddleware, AdminAuthRequest } from '../middleware/authAdmin.js';
import { createRateLimiter } from '../middleware/rateLimit.js';
import { logger } from '../utils/logger.js';

const router = Router();

const subscribeRateLimit = createRateLimiter(60 * 1000, 20, 'Too many subscription attempts. Please wait a moment.');

router.get('/vapid-public-key', (req, res) => {
  res.json({ success: true, key: VAPID_PUBLIC_KEY });
});

router.post('/subscribe/order', subscribeRateLimit, (req, res) => {
  const { token_id, subscription } = req.body;
  if (!token_id || typeof token_id !== 'string') {
    return res.status(400).json({ success: false, error: 'token_id is required' });
  }
  if (!subscription || !subscription.endpoint || !subscription.keys) {
    return res.status(400).json({ success: false, error: 'A valid push subscription object is required' });
  }
  saveSubscription(token_id.trim(), 'student', subscription);
  res.json({ success: true });
});

router.post('/subscribe/admin', subscribeRateLimit, authAdminMiddleware, (req: AdminAuthRequest, res) => {
  const { subscription } = req.body;
  if (!subscription || !subscription.endpoint || !subscription.keys) {
    return res.status(400).json({ success: false, error: 'A valid push subscription object is required' });
  }
  saveSubscription(req.adminUser!.username, 'admin', subscription);
  res.json({ success: true });
});

router.post('/resubscribe', subscribeRateLimit, (req, res) => {
  const { oldEndpoint, subscription } = req.body;
  if (!subscription || !subscription.endpoint || !subscription.keys) {
    return res.status(400).json({ success: false, error: 'A valid push subscription object is required' });
  }
  try {
    replaceSubscriptionEndpoint(oldEndpoint || null, subscription);
    res.json({ success: true });
  } catch (err) {
    logger.error('resubscribe failed', { error: String(err) });
    res.status(500).json({ success: false, error: 'Failed to update subscription' });
  }
});

export default router;
