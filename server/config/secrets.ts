import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { logger } from '../utils/logger.js';

const DATA_DIR = path.join(process.cwd(), 'server', 'data');
const SECRET_FILE = path.join(DATA_DIR, '.jwt_secret');

function loadOrCreatePersistedSecret(): string {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (fs.existsSync(SECRET_FILE)) {
    const existing = fs.readFileSync(SECRET_FILE, 'utf-8').trim();
    if (existing.length >= 32) return existing;
  }
  const generated = crypto.randomBytes(48).toString('hex');
  fs.writeFileSync(SECRET_FILE, generated, { mode: 0o600 });
  logger.warn(
    'JWT_SECRET not set in environment — generated and persisted a random secret for local/demo use',
    { file: SECRET_FILE }
  );
  return generated;
}

export const JWT_SECRET: string = process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 16
  ? process.env.JWT_SECRET
  : loadOrCreatePersistedSecret();

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  logger.warn(
    'Running in production without an explicit JWT_SECRET env var. ' +
    'Set JWT_SECRET in your environment (e.g. your host\'s secret manager) so tokens ' +
    'survive redeploys and the secret is not just a local file on one instance.'
  );
}
