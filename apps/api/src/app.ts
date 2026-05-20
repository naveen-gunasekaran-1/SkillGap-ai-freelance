import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { getCorsOrigins } from './lib/env';
import routes from './routes';
import { errorHandler } from './middleware/error';
import { apiRateLimiter } from './middleware/rateLimit';
import { requestId } from './middleware/requestId';
import { prisma } from './lib/prisma';
import { getStorageConfigurationStatus } from './lib/storage';

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(requestId);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    referrerPolicy: { policy: 'no-referrer' },
  }),
);
app.use(
  cors({
    origin(origin, callback) {
      const allowed = getCorsOrigins();
      if (!origin) {
        callback(null, true);
        return;
      }
      callback(null, allowed.includes('*') || allowed.includes(origin));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use(apiRateLimiter);
app.use(morgan('dev'));
app.use((_req, res, next) => {
  res.setHeader('cache-control', 'no-store');
  next();
});
app.use('/api', routes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/ready', async (_req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    const authTables = await prisma.$queryRaw<
      Array<{ table_name: string }>
    >`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('User', 'RefreshToken', 'account_tokens', 'oauth_accounts', 'AuditLog')`;
    const userColumns = await prisma.$queryRaw<
      Array<{ column_name: string }>
    >`SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'User' AND column_name IN ('failedLoginCount', 'lockedUntil', 'lastLoginAt', 'avatar')`;
    const tableNames = authTables.map((row) => row.table_name);
    const columnNames = userColumns.map((row) => row.column_name);
    const missingAuthTables = [
      'User',
      'RefreshToken',
      'account_tokens',
      'oauth_accounts',
      'AuditLog',
    ].filter((table) => !tableNames.includes(table));
    const missingUserColumns = ['failedLoginCount', 'lockedUntil', 'lastLoginAt', 'avatar'].filter(
      (column) => !columnNames.includes(column),
    );
    res.json({
      status: missingAuthTables.length || missingUserColumns.length ? 'degraded' : 'ready',
      checks: {
        database: 'ok',
        storageConfigured: getStorageConfigurationStatus().configured,
        authSchema:
          missingAuthTables.length || missingUserColumns.length ? 'missing_migrations' : 'ok',
        missingAuthTables,
        missingUserColumns,
      },
    });
  } catch (err) {
    next(err);
  }
});

app.use(errorHandler);

export default app;
