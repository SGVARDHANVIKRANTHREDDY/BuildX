import { webpush } from '../config/vapid.js';
import { logger } from './logger.js';
import {
  getSubscriptionsForToken,
  getAdminSubscriptions,
  removeSubscriptionByEndpoint,
  PushSubscriptionJSON,
} from './pushStore.js';

interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  vibrate?: number[];
  requireInteraction?: boolean;
}

async function sendToAll(subs: PushSubscriptionJSON[], payload: PushPayload): Promise<{ sent: number; removed: number }> {
  let sent = 0;
  let removed = 0;

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(sub as any, JSON.stringify(payload));
        sent += 1;
      } catch (err: any) {
        const statusCode = err?.statusCode;
        if (statusCode === 404 || statusCode === 410) {

          removeSubscriptionByEndpoint(sub.endpoint);
          removed += 1;
        } else {
          logger.error('push send failed', { error: err?.message || String(err), statusCode });
        }
      }
    })
  );

  return { sent, removed };
}

export async function notifyOrderReady(tokenId: string): Promise<void> {
  const subs = getSubscriptionsForToken(tokenId);
  if (subs.length === 0) {
    logger.info('no push subscription for order-ready notification', { tokenId });
    return;
  }
  const result = await sendToAll(subs, {
    title: 'Your order is ready! 🎉',
    body: `Token #${tokenId} — collect it at the counter now.`,
    url: '/',
    tag: `order-${tokenId}`,
    vibrate: [200, 100, 200, 100, 200],
    requireInteraction: true,
  });
  logger.info('order-ready push dispatched', { tokenId, ...result });
}

export async function notifyAdminNewOrder(tokenId: string, itemCount: number): Promise<void> {
  const subs = getAdminSubscriptions();
  if (subs.length === 0) return;
  const result = await sendToAll(subs, {
    title: 'New order received',
    body: `Token #${tokenId} — ${itemCount} item(s)`,
    url: '/',
    tag: 'admin-new-order',
    vibrate: [100, 50, 100],
  });
  logger.info('admin new-order push dispatched', { tokenId, ...result });
}
