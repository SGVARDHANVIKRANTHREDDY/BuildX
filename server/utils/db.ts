import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { logger } from './logger.js';
import { MenuItem, OrderRecord, AdminRecord, OrderStatus } from '../types/index.js';

const DATA_DIR = path.join(process.cwd(), 'server', 'data');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');
const DB_PATH = path.join(DATA_DIR, 'canteen_data.db');

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

const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.pragma('synchronous = NORMAL');

function migrate(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS menu_items (
      item_id      TEXT PRIMARY KEY,
      name         TEXT NOT NULL,
      category     TEXT NOT NULL DEFAULT 'General',
      price        REAL NOT NULL,
      available    INTEGER NOT NULL DEFAULT 1,
      restock_note TEXT
    );

    CREATE TABLE IF NOT EXISTS orders (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      token_id       TEXT NOT NULL,
      date           TEXT NOT NULL,
      items          TEXT NOT NULL,
      total_amount   REAL NOT NULL,
      payment_id     TEXT NOT NULL UNIQUE,
      payment_status TEXT NOT NULL DEFAULT 'PAID',
      order_status   TEXT NOT NULL DEFAULT 'PLACED',
      timestamp      TEXT NOT NULL
    );

    -- Every hot-path query filters by date (today's queue, today's display
    -- board, today's revenue) or looks up one token on one date — these two
    -- indexes turn both from an O(all orders ever placed) table scan into
    -- an O(log n) index lookup.
    CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(date);
    CREATE INDEX IF NOT EXISTS idx_orders_date_token ON orders(date, token_id);
    CREATE INDEX IF NOT EXISTS idx_orders_date_status ON orders(date, order_status);

    CREATE TABLE IF NOT EXISTS counters (
      date        TEXT PRIMARY KEY,
      last_serial INTEGER NOT NULL DEFAULT 0
    );

    -- Same shape as orders, plus archived_at. Rows move here once they're
    -- older than the retention window (see archiveOldOrders) so the hot
    -- orders table — and its indexes — stay a bounded size no matter how
    -- long the app has been running, while order history stays fully
    -- queryable via getOrderHistoryPaginated().
    CREATE TABLE IF NOT EXISTS orders_archive (
      id             INTEGER PRIMARY KEY,
      token_id       TEXT NOT NULL,
      date           TEXT NOT NULL,
      items          TEXT NOT NULL,
      total_amount   REAL NOT NULL,
      payment_id     TEXT NOT NULL,
      payment_status TEXT NOT NULL,
      order_status   TEXT NOT NULL,
      timestamp      TEXT NOT NULL,
      archived_at    TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_orders_archive_date ON orders_archive(date);

    CREATE TABLE IF NOT EXISTS admin (
      username      TEXT PRIMARY KEY,
      password_hash TEXT NOT NULL
    );
  `);

  const menuCount = (db.prepare('SELECT COUNT(*) as c FROM menu_items').get() as { c: number }).c;
  if (menuCount === 0) {
    const insert = db.prepare(
      'INSERT INTO menu_items (item_id, name, category, price, available, restock_note) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const insertMany = db.transaction((items: MenuItem[]) => {
      for (const item of items) {
        insert.run(item.item_id, item.name, item.category, item.price, item.available ? 1 : 0, item.restock_note ?? null);
      }
    });
    insertMany(DEFAULT_MENU);
    logger.info('seeded default menu items', { count: DEFAULT_MENU.length });
  }

  const adminCount = (db.prepare('SELECT COUNT(*) as c FROM admin').get() as { c: number }).c;
  if (adminCount === 0) {
    const defaultHash = bcrypt.hashSync('admin123', 10);
    db.prepare('INSERT INTO admin (username, password_hash) VALUES (?, ?)').run('admin', defaultHash);
    logger.info('seeded default admin account (admin/admin123)');
  }
}

export function initDb(): void {
  migrate();
  logger.info('SQLite data store ready', { path: DB_PATH, mode: 'WAL' });
}

interface MenuRow {
  item_id: string;
  name: string;
  category: string;
  price: number;
  available: number;
  restock_note: string | null;
}

function rowToMenuItem(r: MenuRow): MenuItem {
  return {
    item_id: r.item_id,
    name: r.name,
    category: r.category,
    price: r.price,
    available: r.available === 1,
    restock_note: r.restock_note ?? undefined
  };
}

export function getMenuItems(): MenuItem[] {
  const rows = db.prepare('SELECT * FROM menu_items ORDER BY item_id').all() as MenuRow[];
  return rows.map(rowToMenuItem);
}

export function insertMenuItem(item: MenuItem): void {
  db.prepare(
    'INSERT INTO menu_items (item_id, name, category, price, available, restock_note) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(item.item_id, item.name, item.category, item.price, item.available ? 1 : 0, item.restock_note ?? null);
}

export function updateMenuItem(
  itemId: string,
  patch: Partial<Pick<MenuItem, 'name' | 'price' | 'available' | 'restock_note'>>
): MenuItem | null {
  const existing = db.prepare('SELECT * FROM menu_items WHERE item_id = ?').get(itemId) as MenuRow | undefined;
  if (!existing) return null;

  const next: MenuRow = {
    ...existing,
    name: patch.name ?? existing.name,
    price: typeof patch.price === 'number' ? patch.price : existing.price,
    available: typeof patch.available === 'boolean' ? (patch.available ? 1 : 0) : existing.available,
    restock_note:
      patch.restock_note !== undefined ? (patch.restock_note || null) : existing.restock_note
  };

  if (typeof patch.available === 'boolean' && patch.available) {
    next.restock_note = null;
  }

  db.prepare(
    'UPDATE menu_items SET name = ?, price = ?, available = ?, restock_note = ? WHERE item_id = ?'
  ).run(next.name, next.price, next.available, next.restock_note, itemId);

  return rowToMenuItem(next);
}

export function getNextMenuItemId(): string {
  const rows = db.prepare("SELECT item_id FROM menu_items WHERE item_id LIKE 'ITM%'").all() as { item_id: string }[];
  const usedNumbers = rows
    .map(r => {
      const match = /^ITM(\d+)$/.exec(r.item_id);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter(n => Number.isFinite(n));
  const nextNumber = (usedNumbers.length > 0 ? Math.max(...usedNumbers) : 0) + 1;
  return `ITM${String(nextNumber).padStart(3, '0')}`;
}

export function findMenuItemByName(name: string): MenuItem | null {
  const row = db
    .prepare('SELECT * FROM menu_items WHERE LOWER(name) = LOWER(?)')
    .get(name.trim()) as MenuRow | undefined;
  return row ? rowToMenuItem(row) : null;
}

interface OrderRow {
  id: number;
  token_id: string;
  date: string;
  items: string;
  total_amount: number;
  payment_id: string;
  payment_status: string;
  order_status: string;
  timestamp: string;
}

function rowToOrder(r: OrderRow): OrderRecord {
  return {
    token_id: r.token_id,
    date: r.date,
    items: r.items,
    total_amount: r.total_amount,
    payment_id: r.payment_id,
    payment_status: r.payment_status as OrderRecord['payment_status'],
    order_status: r.order_status as OrderStatus,
    timestamp: r.timestamp
  };
}

export function getOrders(): OrderRecord[] {
  const rows = db.prepare('SELECT * FROM orders ORDER BY id').all() as OrderRow[];
  return rows.map(rowToOrder);
}

export function getOrdersForDate(date: string): OrderRecord[] {
  const rows = db.prepare('SELECT * FROM orders WHERE date = ? ORDER BY id').all(date) as OrderRow[];
  return rows.map(rowToOrder);
}

export function getOrderByToken(tokenId: string, date: string): OrderRecord | null {
  const row = db
    .prepare('SELECT * FROM orders WHERE token_id = ? AND date = ?')
    .get(tokenId, date) as OrderRow | undefined;
  return row ? rowToOrder(row) : null;
}

export function getOrderByPaymentId(paymentId: string): OrderRecord | null {
  const row = db.prepare('SELECT * FROM orders WHERE payment_id = ?').get(paymentId) as OrderRow | undefined;
  return row ? rowToOrder(row) : null;
}

export function addOrder(order: OrderRecord): void {
  db.prepare(
    `INSERT INTO orders (token_id, date, items, total_amount, payment_id, payment_status, order_status, timestamp)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    order.token_id,
    order.date,
    order.items,
    order.total_amount,
    order.payment_id,
    order.payment_status,
    order.order_status,
    order.timestamp
  );
}

export function updateOrderStatus(tokenId: string, status: OrderStatus, date: string): boolean {
  const result = db
    .prepare('UPDATE orders SET order_status = ? WHERE token_id = ? AND date = ?')
    .run(status, tokenId, date);
  return result.changes > 0;
}

export function nextTokenSerial(date: string): number {
  const row = db
    .prepare(
      `INSERT INTO counters (date, last_serial) VALUES (?, 1)
       ON CONFLICT(date) DO UPDATE SET last_serial = last_serial + 1
       RETURNING last_serial`
    )
    .get(date) as { last_serial: number };
  return row.last_serial;
}

export function getAdminRecord(username: string): AdminRecord | null {
  const row = db
    .prepare('SELECT * FROM admin WHERE LOWER(username) = LOWER(?)')
    .get(username) as AdminRecord | undefined;
  return row ?? null;
}

export function updateAdminPassword(username: string, newPasswordHash: string): boolean {
  const result = db
    .prepare('UPDATE admin SET password_hash = ? WHERE LOWER(username) = LOWER(?)')
    .run(newPasswordHash, username);
  return result.changes > 0;
}

export function backupNow(): void {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(BACKUP_DIR, `canteen_data_${timestamp}.db`);
    db.backup(backupPath)
      .then(() => {
        logger.info('db backup snapshot created', { backupPath });
        const backups = fs
          .readdirSync(BACKUP_DIR)
          .filter(f => f.startsWith('canteen_data_') && f.endsWith('.db'))
          .sort();
        if (backups.length > 30) {
          const toDelete = backups.slice(0, backups.length - 30);
          for (const file of toDelete) {
            fs.unlinkSync(path.join(BACKUP_DIR, file));
          }
        }
      })
      .catch((err: unknown) => logger.warn('db backup failed', { error: String(err) }));
  } catch (err) {
    logger.warn('db backup failed to start', { error: String(err) });
  }
}

let backupTimer: NodeJS.Timeout | null = null;

export function scheduleBackups(intervalMs = 60 * 60 * 1000): void {
  if (backupTimer) return;
  backupTimer = setInterval(backupNow, intervalMs);
  backupTimer.unref();
}

export function archiveOldOrders(daysToKeep = Number(process.env.ORDER_RETENTION_DAYS) || 90): number {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysToKeep);
  const cutoffDate = cutoff.toISOString().split('T')[0];

  const archivedAt = new Date().toISOString();

  const archive = db.transaction((): number => {
    const rows = db.prepare('SELECT * FROM orders WHERE date < ?').all(cutoffDate) as OrderRow[];
    if (rows.length === 0) return 0;

    const insert = db.prepare(
      `INSERT INTO orders_archive (id, token_id, date, items, total_amount, payment_id, payment_status, order_status, timestamp, archived_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    for (const r of rows) {
      insert.run(r.id, r.token_id, r.date, r.items, r.total_amount, r.payment_id, r.payment_status, r.order_status, r.timestamp, archivedAt);
    }

    db.prepare('DELETE FROM orders WHERE date < ?').run(cutoffDate);
    return rows.length;
  });

  const archivedCount = archive();
  if (archivedCount > 0) {
    logger.info('archived old orders out of the live table', { archivedCount, cutoffDate, daysToKeep });
  }
  return archivedCount;
}

let archiveTimer: NodeJS.Timeout | null = null;

export function scheduleArchiving(
  intervalMs = 24 * 60 * 60 * 1000,
  daysToKeep = Number(process.env.ORDER_RETENTION_DAYS) || 90
): void {
  if (archiveTimer) return;

  setTimeout(() => {
    try {
      archiveOldOrders(daysToKeep);
    } catch (err) {
      logger.warn('order archiving failed', { error: String(err) });
    }
  }, 60 * 1000).unref();

  archiveTimer = setInterval(() => {
    try {
      archiveOldOrders(daysToKeep);
    } catch (err) {
      logger.warn('order archiving failed', { error: String(err) });
    }
  }, intervalMs);
  archiveTimer.unref();
}

export function getOrderHistoryPaginated(page: number, pageSize: number): { orders: OrderRecord[]; total: number } {
  const offset = (page - 1) * pageSize;

  const totalRow = db
    .prepare(
      `SELECT
         (SELECT COUNT(*) FROM orders) + (SELECT COUNT(*) FROM orders_archive) AS c`
    )
    .get() as { c: number };

  const rows = db
    .prepare(
      `SELECT token_id, date, items, total_amount, payment_id, payment_status, order_status, timestamp
       FROM (
         SELECT token_id, date, items, total_amount, payment_id, payment_status, order_status, timestamp FROM orders
         UNION ALL
         SELECT token_id, date, items, total_amount, payment_id, payment_status, order_status, timestamp FROM orders_archive
       )
       ORDER BY timestamp DESC
       LIMIT ? OFFSET ?`
    )
    .all(pageSize, offset) as OrderRow[];

  return {
    orders: rows.map(rowToOrder),
    total: totalRow.c
  };
}

export function closeDb(): void {
  if (backupTimer) clearInterval(backupTimer);
  if (archiveTimer) clearInterval(archiveTimer);
  db.close();
}

export default db;
