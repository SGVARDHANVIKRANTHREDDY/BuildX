import fs from 'fs';
import path from 'path';
import webpush from 'web-push';
import { logger } from '../utils/logger.js';

const DATA_DIR = path.join(process.cwd(), 'server', 'data');
const VAPID_FILE = path.join(DATA_DIR, '.vapid_keys.json');

interface VapidKeys {
  publicKey: string;
  privateKey: string;
}

function loadOrCreateVapidKeys(): VapidKeys {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  if (fs.existsSync(VAPID_FILE)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(VAPID_FILE, 'utf-8'));
      if (parsed.publicKey && parsed.privateKey) return parsed;
    } catch {

    }
  }

  const generated = webpush.generateVAPIDKeys();
  fs.writeFileSync(VAPID_FILE, JSON.stringify(generated, null, 2), { mode: 0o600 });
  logger.warn(
    'VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY not set — generated and persisted a keypair for local/demo push notifications',
    { file: VAPID_FILE }
  );
  return generated;
}

const envPublic = process.env.VAPID_PUBLIC_KEY;
const envPrivate = process.env.VAPID_PRIVATE_KEY;

const keys: VapidKeys =
  envPublic && envPrivate ? { publicKey: envPublic, privateKey: envPrivate } : loadOrCreateVapidKeys();

export const VAPID_PUBLIC_KEY = keys.publicKey;
export const VAPID_PRIVATE_KEY = keys.privateKey;
export const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@example.com';

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

export { webpush };
