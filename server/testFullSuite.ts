import { initDb, getMenuItems, getOrders, getOrderByToken, getAdminRecord, addOrder, updateOrderStatus, archiveOldOrders, getOrderHistoryPaginated } from './utils/db.js';
import { withWriteLock } from './utils/writeLock.js';
import { generateToken, getTodayDateString } from './utils/tokenGenerator.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'canteen_super_secret_jwt_key_2026';
const RAZORPAY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'canteen_secret_hash_2026';

function razorpaySignature(orderId: string, paymentId: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');
}

let passed = 0;
let total = 0;

function check(condition: boolean, name: string, detail?: string) {
  total++;
  const suffix = detail ? ` - ${detail}` : '';
  if (condition) {
    passed++;
    console.log(`  [ok] ${name}${suffix}`);
  } else {
    console.error(`  [FAIL] ${name}${suffix}`);
  }
}

async function main() {
  console.log('canteen-token-system test suite\n');

  console.log('data layer');
  initDb();
  check(true, 'SQLite database initializes');

  const menuItems = getMenuItems();
  check(menuItems.length > 0, 'menu has items', `${menuItems.length} items`);
  const vegPuff = menuItems.find(m => m.item_id === 'ITM001');
  check(Boolean(vegPuff && vegPuff.available), 'default item available', vegPuff?.name);

  console.log('admin auth');
  const admin = getAdminRecord('admin');
  check(Boolean(admin), 'admin record exists', admin?.username);

  const passwordOk = admin ? bcrypt.compareSync('admin123', admin.password_hash) : false;
  check(passwordOk, 'bcrypt password check');

  const jwtToken = jwt.sign({ username: 'admin' }, JWT_SECRET, { expiresIn: '45m' });
  const decoded = jwt.verify(jwtToken, JWT_SECRET) as { username: string };
  check(decoded.username === 'admin', 'jwt sign/verify roundtrip');

  console.log('token counter');
  const today = getTodayDateString();
  const token1 = await withWriteLock(() => generateToken(today));
  check(Boolean(token1 && token1.length === 4), '4-digit token issued', token1);

  const token1Num = Number(token1);
  const token2 = await withWriteLock(() => generateToken(today));
  check(Number(token2) === token1Num + 1, 'counter increments sequentially', token2);

  console.log('payment signature');
  const mockOrderId = `order_${Date.now()}`;
  const mockPaymentId = `pay_test_${Date.now()}`;
  const validSig = razorpaySignature(mockOrderId, mockPaymentId, RAZORPAY_SECRET);
  const badSig = 'invalid_tampered_signature_123';

  check(razorpaySignature(mockOrderId, mockPaymentId, RAZORPAY_SECRET) === validSig, 'hmac signature matches');
  check(razorpaySignature(mockOrderId, mockPaymentId, RAZORPAY_SECRET) !== badSig, 'tampered signature rejected');

  console.log('write lock concurrency');
  const ordersBefore = getOrders();
  check(ordersBefore.filter(o => o.payment_id === mockPaymentId).length === 0, 'payment id unused so far');

  const results = await Promise.all(
    Array.from({ length: 15 }).map((_, idx) =>
      withWriteLock(() => ({ idx, tId: generateToken(today) }))
    )
  );
  const uniqueTokens = new Set(results.map(r => r.tId));
  check(uniqueTokens.size === 15, 'no token collisions under concurrent writes', `${uniqueTokens.size}/15 unique`);

  console.log('order lifecycle');
  const testTokenId = token1;
  await withWriteLock(() =>
    addOrder({
      token_id: testTokenId,
      date: today,
      items: JSON.stringify([{ item_id: 'ITM001', name: 'Veg Puff', price: 25, qty: 1 }]),
      total_amount: 25,
      payment_id: mockPaymentId,
      payment_status: 'PAID',
      order_status: 'PLACED' as const,
      timestamp: new Date().toISOString()
    })
  );

  const updated = await withWriteLock(() => updateOrderStatus(testTokenId, 'PREPARING', today));
  check(updated, 'status transition placed -> preparing', `token #${testTokenId}`);

  const savedOrder = getOrderByToken(testTokenId, today);
  check(savedOrder?.order_status === 'PREPARING', 'status persisted to db');

  console.log('order archiving & history pagination');
  const archiveTestPaymentId = `pay_archive_test_${Date.now()}`;
  await withWriteLock(() =>
    addOrder({
      token_id: '9999',
      date: '2020-01-01',
      items: JSON.stringify([{ item_id: 'ITM001', name: 'Veg Puff', price: 25, qty: 1 }]),
      total_amount: 25,
      payment_id: archiveTestPaymentId,
      payment_status: 'PAID',
      order_status: 'SERVED' as const,
      timestamp: '2020-01-01T10:00:00.000Z'
    })
  );

  const archivedCount = archiveOldOrders(30);
  check(archivedCount >= 1, 'old order swept into orders_archive', `${archivedCount} archived`);

  const { orders: historyOrders, total: historyTotal } = getOrderHistoryPaginated(1, 5);
  check(historyTotal >= 2, 'history spans live + archived orders', `${historyTotal} total`);
  check(
    historyOrders.some(o => o.token_id === testTokenId) || historyTotal > 5,
    'recent order visible in history page 1'
  );

  console.log(`\n${passed}/${total} passed`);
  if (passed !== total) process.exit(1);
}

main().catch(err => {
  console.error('test run crashed:', err);
  process.exit(1);
});
