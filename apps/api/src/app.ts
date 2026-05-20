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
    res.json({
      status: 'ready',
      checks: {
        database: 'ok',
        storageConfigured: getStorageConfigurationStatus().configured,
      },
    });
  } catch (err) {
    next(err);
  }
});

app.use(errorHandler);

export default app;
