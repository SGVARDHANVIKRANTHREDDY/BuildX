import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';
import bcrypt from 'bcryptjs';
import { logger } from './logger.js';
import { getTodayDateString } from './tokenGenerator.js';
import { MenuItem, OrderRecord, CounterRecord, AdminRecord, OrderStatus } from '../types/index.js';

const xlsxLib = (XLSX as any).default || XLSX;

const DATA_DIR = path.join(process.cwd(), 'server', 'data');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');
const WORKBOOK_PATH = path.join(DATA_DIR, 'canteen_data.xlsx');

const SHEET_MENU = 'Menu';
const SHEET_ORDERS = 'Orders';
const SHEET_COUNTER = 'Counter';
const SHEET_ADMIN = 'Admin';

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

const DEFAULT_MENU: MenuItem[] = [
  { item_id: 'ITM001', name: 'Veg Puff', category: 'Snacks', price: 25, available: true },
  { item_id: 'ITM002', name: 'Samosa (2 pcs)', category: 'Snacks', price: 30, available: true },
  { item_id: 'ITM003', name: 'Masala Dosa', category: 'South Indian', price: 60, available: true },
  { item_id: 'ITM004', name: 'Idli Vada Combo', category: 'South Indian', price: 50, available: true },
  { item_id: 'ITM005', name: 'Crispy Veg Burger', category: 'Fast Food', price: 70, available: true },
  { item_id: 'ITM006', name: 'Paneer Grilled Sandwich', category: 'Fast Food', price: 80, available: true },
  { item_id: 'ITM007', name: 'Cold Coffee', category: 'Beverages', price: 45, available: true },
  { item_id: 'ITM008', name: 'Masala Chai', category: 'Beverages', price: 15, available: true },
  { item_id: 'ITM009', name: 'Fresh Lime Soda', category: 'Beverages', price: 35, available: true },
];

function createInitialWorkbook(): XLSX.WorkBook {
  const wb = xlsxLib.utils.book_new();

  const wsMenu = xlsxLib.utils.json_to_sheet(DEFAULT_MENU);
  xlsxLib.utils.book_append_sheet(wb, wsMenu, SHEET_MENU);

  const initialOrders: OrderRecord[] = [];
  const wsOrders = xlsxLib.utils.json_to_sheet(initialOrders, {
    header: ['token_id', 'date', 'items', 'total_amount', 'payment_id', 'payment_status', 'order_status', 'timestamp']
  });
  xlsxLib.utils.book_append_sheet(wb, wsOrders, SHEET_ORDERS);

  const initialCounters: CounterRecord[] = [];
  const wsCounter = xlsxLib.utils.json_to_sheet(initialCounters, {
    header: ['date', 'last_serial']
  });
  xlsxLib.utils.book_append_sheet(wb, wsCounter, SHEET_COUNTER);

  
  const defaultAdminHash = bcrypt.hashSync('admin123', 10);
  const defaultAdmin: AdminRecord[] = [
    { username: 'admin', password_hash: defaultAdminHash }
  ];
  const wsAdmin = xlsxLib.utils.json_to_sheet(defaultAdmin, {
    header: ['username', 'password_hash']
  });
  xlsxLib.utils.book_append_sheet(wb, wsAdmin, SHEET_ADMIN);

  return wb;
}

function getLatestBackupPath(): string | null {
  try {
    if (!fs.existsSync(BACKUP_DIR)) return null;
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith('canteen_data_') && f.endsWith('.xlsx'))
      .sort()
      .reverse();
    if (files.length > 0) {
      return path.join(BACKUP_DIR, files[0]);
    }
  } catch (err) {
    logger.error('Failed to find backup files', { error: String(err) });
  }
  return null;
}

function backupWorkbook(): void {
  try {
    if (fs.existsSync(WORKBOOK_PATH)) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(BACKUP_DIR, `canteen_data_${timestamp}.xlsx`);
      fs.copyFileSync(WORKBOOK_PATH, backupPath);
      logger.info('Workbook backup snapshot created', { backupPath });

      
      const backups = fs.readdirSync(BACKUP_DIR)
        .filter(f => f.startsWith('canteen_data_') && f.endsWith('.xlsx'))
        .sort();
      if (backups.length > 30) {
        const toDelete = backups.slice(0, backups.length - 30);
        for (const file of toDelete) {
          fs.unlinkSync(path.join(BACKUP_DIR, file));
        }
      }
    }
  } catch (err) {
    logger.warn('Could not create backup snapshot before write', { error: String(err) });
  }
}

export function readWorkbook(): XLSX.WorkBook {
  if (!fs.existsSync(WORKBOOK_PATH)) {
    logger.info('workbook missing, creating a fresh one');
    const newWb = createInitialWorkbook();
    writeWorkbook(newWb);
    return newWb;
  }

  try {
    const fileBuffer = fs.readFileSync(WORKBOOK_PATH);
    const wb = xlsxLib.read(fileBuffer, { type: 'buffer' });
    const requiredSheets = [SHEET_MENU, SHEET_ORDERS, SHEET_COUNTER, SHEET_ADMIN];
    const missingSheets = requiredSheets.filter(s => !wb.SheetNames.includes(s));
    if (missingSheets.length > 0) {
      throw new Error(`workbook missing sheets: ${missingSheets.join(', ')}`);
    }
    return wb;
  } catch (error) {
    logger.error('workbook read failed, trying last backup', { error: String(error) });
    const fallbackPath = getLatestBackupPath();
    if (fallbackPath && fs.existsSync(fallbackPath)) {
      try {
        logger.info('restoring from backup', { fallbackPath });
        const fallbackBuffer = fs.readFileSync(fallbackPath);
        const restoredWb = xlsxLib.read(fallbackBuffer, { type: 'buffer' });
        writeWorkbook(restoredWb);
        return restoredWb;
      } catch (fbErr) {
        logger.error('backup also failed to parse, rebuilding from scratch', { error: String(fbErr) });
      }
    }
    const freshWb = createInitialWorkbook();
    writeWorkbook(freshWb);
    return freshWb;
  }
}


export function writeWorkbook(wb: XLSX.WorkBook): void {
  backupWorkbook();
  const fileBuffer = xlsxLib.write(wb, { type: 'buffer', bookType: 'xlsx' });
  const tempPath = `${WORKBOOK_PATH}.tmp.${Date.now()}.${Math.random().toString(36).substring(2, 7)}`;
  fs.writeFileSync(tempPath, fileBuffer);
  fs.renameSync(tempPath, WORKBOOK_PATH);
}

export function getMenuItems(wb?: XLSX.WorkBook): MenuItem[] {
  const currentWb = wb || readWorkbook();
  const sheet = currentWb.Sheets[SHEET_MENU];
  if (!sheet) return [];
  const rows = xlsxLib.utils.sheet_to_json(sheet);
  return rows.map((r: any) => ({
    item_id: String(r.item_id || ''),
    name: String(r.name || ''),
    category: String(r.category || 'General'),
    price: Number(r.price) || 0,
    available: r.available === true || String(r.available).toUpperCase() === 'TRUE',
    restock_note: r.restock_note ? String(r.restock_note) : undefined
  }));
}

export function saveMenuItems(items: MenuItem[], wb?: XLSX.WorkBook): void {
  const currentWb = wb || readWorkbook();
  const ws = xlsxLib.utils.json_to_sheet(items);
  currentWb.Sheets[SHEET_MENU] = ws;
  if (!wb) {
    writeWorkbook(currentWb);
  }
}

export function getOrders(wb?: XLSX.WorkBook): OrderRecord[] {
  const currentWb = wb || readWorkbook();
  const sheet = currentWb.Sheets[SHEET_ORDERS];
  if (!sheet) return [];
  const rows = xlsxLib.utils.sheet_to_json(sheet);
  return rows.map((r: any) => ({
    token_id: String(r.token_id || ''),
    date: String(r.date || ''),
    items: typeof r.items === 'string' ? r.items : JSON.stringify(r.items || []),
    total_amount: Number(r.total_amount) || 0,
    payment_id: String(r.payment_id || ''),
    payment_status: (r.payment_status as any) || 'PAID',
    order_status: (r.order_status as any) || 'PLACED',
    timestamp: String(r.timestamp || '')
  }));
}

export function addOrder(order: OrderRecord, wb: XLSX.WorkBook): void {
  const orders = getOrders(wb);
  orders.push(order);
  const ws = xlsxLib.utils.json_to_sheet(orders, {
    header: ['token_id', 'date', 'items', 'total_amount', 'payment_id', 'payment_status', 'order_status', 'timestamp']
  });
  wb.Sheets[SHEET_ORDERS] = ws;
}

export function updateOrderStatusInWb(tokenId: string, status: OrderStatus, wb: XLSX.WorkBook, date?: string): boolean {
  const orders = getOrders(wb);
  const targetDate = date || getTodayDateString();
  const order = orders.find(o => String(o.token_id) === String(tokenId) && o.date === targetDate);
  if (!order) return false;
  order.order_status = status;
  const ws = xlsxLib.utils.json_to_sheet(orders, {
    header: ['token_id', 'date', 'items', 'total_amount', 'payment_id', 'payment_status', 'order_status', 'timestamp']
  });
  wb.Sheets[SHEET_ORDERS] = ws;
  return true;
}

export function getCounterRows(wb?: XLSX.WorkBook): CounterRecord[] {
  const currentWb = wb || readWorkbook();
  const sheet = currentWb.Sheets[SHEET_COUNTER];
  if (!sheet) return [];
  const rows = xlsxLib.utils.sheet_to_json(sheet);
  return rows.map((r: any) => ({
    date: String(r.date || ''),
    last_serial: Number(r.last_serial) || 0
  }));
}

export function getCounterRow(date: string, wb: XLSX.WorkBook): CounterRecord | null {
  const rows = getCounterRows(wb);
  const match = rows.find(r => r.date === date);
  return match || null;
}

export function setCounterRow(date: string, lastSerial: number, wb: XLSX.WorkBook): void {
  const rows = getCounterRows(wb);
  const index = rows.findIndex(r => r.date === date);
  if (index >= 0) {
    rows[index].last_serial = lastSerial;
  } else {
    rows.push({ date, last_serial: lastSerial });
  }
  const ws = xlsxLib.utils.json_to_sheet(rows, {
    header: ['date', 'last_serial']
  });
  wb.Sheets[SHEET_COUNTER] = ws;
}

export function getAdminRecord(username: string, wb?: XLSX.WorkBook): AdminRecord | null {
  const currentWb = wb || readWorkbook();
  const sheet = currentWb.Sheets[SHEET_ADMIN];
  if (!sheet) return null;
  const rows = xlsxLib.utils.sheet_to_json(sheet);
  const match = rows.find((r: any) => String(r.username).toLowerCase() === username.toLowerCase());
  if (!match) return null;
  return {
    username: String(match.username),
    password_hash: String(match.password_hash)
  };
}

