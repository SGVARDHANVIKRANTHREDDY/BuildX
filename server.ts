import 'dotenv/config';
import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { initDb, getAdminRecord, scheduleBackups, scheduleArchiving } from './server/utils/db.js';
import { logger } from './server/utils/logger.js';
import bcrypt from 'bcryptjs';

import menuRoutes from './server/routes/menu.js';
import paymentRoutes from './server/routes/payment.js';
import orderRoutes from './server/routes/order.js';
import adminRoutes from './server/routes/admin.js';
import displayRoutes from './server/routes/display.js';
import concurrencyRoutes from './server/routes/concurrency.js';
import notificationRoutes from './server/routes/notifications.js';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  logger.info('Initializing Canteen Data Store...');
  try {
    initDb();

    scheduleBackups();

    scheduleArchiving();

    const adminRecord = getAdminRecord('admin');
    if (adminRecord && bcrypt.compareSync('admin123', adminRecord.password_hash)) {
      logger.warn(
        'Admin account is still using the default password (admin/admin123). ' +
        'Change it before deploying anywhere real users can reach this server.'
      );
    }
  } catch (err) {
    logger.error('Failed to initialize data store on startup', { error: String(err) });
  }

  if (process.env.TRUST_PROXY === 'true') {
    app.set('trust proxy', 1);
  }

  app.use(cors({ credentials: true, origin: true }));
  app.use(express.json());

  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'CanteenOS — Canteen Order & Token System',
      store: 'SQLite (WAL mode)',
      time: new Date().toISOString()
    });
  });

  app.use('/api/menu', menuRoutes);
  app.use('/api/payment', paymentRoutes);
  app.use('/api/order', orderRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/display', displayRoutes);
  app.use('/api/concurrency', concurrencyRoutes);
  app.use('/api/notifications', notificationRoutes);

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`CanteenOS Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  logger.error('Fatal error in server bootstrap', { error: String(err) });
  process.exit(1);
});
