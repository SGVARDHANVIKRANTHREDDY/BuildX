import { readWorkbook, getMenuItems, getOrders, getAdminRecord } from './utils/excelHandler.js';
import { withWriteLock } from './utils/writeLock.js';
import { generateToken, getTodayDateString } from './utils/tokenGenerator.js';
import { logger } from './utils/logger.js';
import bcrypt from 'bcryptjs';

async function runSanityCheck() {
  console.log('phase 1 sanity check\n');

  
  console.log('1. Reading / Initializing workbook...');
  const wb = readWorkbook();
  console.log('   Sheets found:', wb.SheetNames.join(', '));
  const expectedSheets = ['Menu', 'Orders', 'Counter', 'Admin'];
  const hasAllSheets = expectedSheets.every(s => wb.SheetNames.includes(s));
  console.log(`   All 4 required sheets present: ${hasAllSheets ? 'OK' : 'FAIL'}`);

  
  const menu = getMenuItems(wb);
  console.log(`2. Menu sheet items count: ${menu.length}`);
  console.log(`   Sample item: ${JSON.stringify(menu[0])}`);

  
  const admin = getAdminRecord('admin', wb);
  const isValidAdmin = admin ? bcrypt.compareSync('admin123', admin.password_hash) : false;
  console.log(`3. Admin authentication hash check: ${isValidAdmin ? 'OK (admin/admin123 verified)' : 'FAIL'}`);

  
  console.log('\n4. Testing Concurrent Order & Token Generation under write lock (10 parallel tasks)...');
  const today = getTodayDateString();
  const tasks = Array.from({ length: 10 }).map((_, i) => {
    return withWriteLock(async (lockedWb) => {
      const tokenId = generateToken(lockedWb, today);
      return { taskId: i, tokenId };
    });
  });

  const results = await Promise.all(tasks);
  console.log('   Tokens generated:', results.map(r => r.tokenId).join(', '));
  
  const tokenSet = new Set(results.map(r => r.tokenId));
  const hasDuplicates = tokenSet.size !== results.length;
  console.log(`   Unique tokens count: ${tokenSet.size}/10`);
  console.log(`   Duplicate token collision test: ${!hasDuplicates ? 'OK (Zero collisions)' : 'FAIL (Duplicate found)'}`);

  console.log('\ndone\n');
}

runSanityCheck().catch(err => {
  console.error('Sanity check failed:', err);
  process.exit(1);
});
