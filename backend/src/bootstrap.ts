import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';

import authRoutes from './routes/auth.js';
import analysesRoutes from './routes/analyses.js';
import notificationsRoutes from './routes/notifications.js';
import userRoutes from './routes/user.js';
import { connectDB } from './config/db.js';
import { loadBackendConfig } from './config/env.js';
import { errorHandler } from './middleware/errorMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });
// Fallback: also try the src-level .env if present
dotenv.config({ path: path.resolve(__dirname, '.env') });

const config = loadBackendConfig();
const app = express();
const clientDistPath = path.resolve(__dirname, '../../frontend/dist');
const rootUploadsPath = path.resolve(__dirname, '../uploads');

async function start() {
  // Connect to DB first; abort if fails
  await connectDB();

  // Register middleware FIRST so CORS headers are always sent
  app.use(
    cors({
      origin: config.corsOrigin.split(',').map((item) => item.trim()).filter(Boolean),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // Handle CORS pre-flight for all routes explicitly
  app.options('*', cors({
    origin: config.corsOrigin.split(',').map((item) => item.trim()).filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  }));

  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));
  app.use(cookieParser());
  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));
  app.use('/uploads', express.static(rootUploadsPath));
  app.use(express.static(clientDistPath));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'RootCause AI Backend API Engine', timestamp: new Date().toISOString() });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/analyses', analysesRoutes);
  app.use('/api/notifications', notificationsRoutes);
  app.use('/api/user', userRoutes);

  app.get(/^\/(?!api(?:\/|$)|uploads(?:\/|$)).*/, (_req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });

  // Global error handler
  app.use(errorHandler);

  // Start listening AFTER DB is ready
  app.listen(config.port, () => {
    console.log(`⚡ RootCause AI Backend API Engine running at http://localhost:${config.port}`);
  });
}

start().catch((err) => {
  console.error('Backend startup failed:', err);
  process.exit(1);
});
