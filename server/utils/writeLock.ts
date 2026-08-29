import { Mutex } from 'async-mutex';
import { logger } from './logger.js';

const orderMutex = new Mutex();

export async function withWriteLock<T>(fn: () => Promise<T> | T): Promise<T> {
  const lockStartTime = Date.now();
  return orderMutex.runExclusive(async () => {
    const waitMs = Date.now() - lockStartTime;
    if (waitMs > 50) {
      logger.info('write lock queued', { waitMs });
    }
    return fn();
  });
}
