import fs from 'fs';
import path from 'path';
import { logger } from './logger.js';

const DATA_DIR = path.join(process.cwd(), 'server', 'data');
const FILE = path.join(DATA_DIR, 'push_subscriptions.json');

export interface PushSubscriptionJSON {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  [key: string]: any;
}

interface StoredSub {
  token_id: string;
  role: 'student' | 'admin';
  subscription: PushSubscriptionJSON;
  createdAt: string;
}

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readAll(): StoredSub[] {
  if (!fs.existsSync(FILE)) return [];
  try {
    const raw = fs.readFileSync(FILE, 'utf-8');
    if (!raw.trim()) return [];
    return JSON.parse(raw);
  } catch (err) {
    logger.error('push subscription store: failed to read/parse, resetting', { error: String(err) });
    return [];
  }
}

function writeAll(subs: StoredSub[]): void {
  try {
    fs.writeFileSync(FILE, JSON.stringify(subs, null, 2));
  } catch (err) {
    logger.error('push subscription store: failed to write', { error: String(err) });
  }
}

export function saveSubscription(
  token_id: string,
  role: 'student' | 'admin',
  subscription: PushSubscriptionJSON
): void {
  const subs = readAll().filter(s => s.subscription.endpoint !== subscription.endpoint);
  subs.push({ token_id, role, subscription, createdAt: new Date().toISOString() });
  writeAll(subs);
  logger.info('push subscription saved', { role, token_id, endpoint: subscription.endpoint.slice(-24) });
}

export function getSubscriptionsForToken(token_id: string): PushSubscriptionJSON[] {
  return readAll()
    .filter(s => s.role === 'student' && s.token_id === token_id)
    .map(s => s.subscription);
}

export function getAdminSubscriptions(): PushSubscriptionJSON[] {
  return readAll()
    .filter(s => s.role === 'admin')
    .map(s => s.subscription);
}

export function removeSubscriptionByEndpoint(endpoint: string): void {
  const subs = readAll();
  const next = subs.filter(s => s.subscription.endpoint !== endpoint);
  if (next.length !== subs.length) writeAll(next);
}

export function replaceSubscriptionEndpoint(oldEndpoint: string | null, newSub: PushSubscriptionJSON): void {
  const subs = readAll();
  let matched = false;
  const next = subs.map(s => {
    if (oldEndpoint && s.subscription.endpoint === oldEndpoint) {
      matched = true;
      return { ...s, subscription: newSub };
    }
    return s;
  });
  if (matched) writeAll(next);
}
