import * as XLSX from 'xlsx';
import { getCounterRow, setCounterRow } from './excelHandler.js';
import { logger } from './logger.js';


export function generateToken(workbook: XLSX.WorkBook, currentDate: string): string {
  const counterRow = getCounterRow(currentDate, workbook);

  let nextSerial = 1;
  if (counterRow && counterRow.last_serial > 0) {
    nextSerial = counterRow.last_serial + 1;
  }

  setCounterRow(currentDate, nextSerial, workbook);

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
