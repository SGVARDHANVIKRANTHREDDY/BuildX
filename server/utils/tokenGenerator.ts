import { nextTokenSerial } from './db.js';
import { logger } from './logger.js';

export function generateToken(currentDate: string): string {
  const nextSerial = nextTokenSerial(currentDate);
  const tokenId = String(1000 + nextSerial);
  logger.info('token issued', { date: currentDate, serial: nextSerial, tokenId });
  return tokenId;
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
