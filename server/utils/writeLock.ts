import { Mutex } from 'async-mutex';
import * as XLSX from 'xlsx';
import { readWorkbook, writeWorkbook } from './excelHandler.js';
import { logger } from './logger.js';

const workbookMutex = new Mutex();


export async function withWriteLock<T>(fn: (workbook: XLSX.WorkBook) => Promise<T> | T): Promise<T> {
  const lockStartTime = Date.now();
  return workbookMutex.runExclusive(async () => {
    const waitMs = Date.now() - lockStartTime;
    if (waitMs > 50) {
      logger.info('write lock queued', { waitMs });
    }

    try {
      const workbook = readWorkbook();
      const result = await fn(workbook);
      writeWorkbook(workbook);
      return result;
    } catch (error) {
      logger.error('write lock transaction failed', { error: String(error) });
      throw error;
    }
  });
}
