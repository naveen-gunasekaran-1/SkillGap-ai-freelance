import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { getCorsOrigins } from './lib/env';
import routes from './routes';
import { errorHandler } from './middleware/error';
import { apiRateLimiter } from './middleware/rateLimit';

const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      const allowed = getCorsOrigins();
      if (!origin) {
        callback(null, true);
        return;
      }
      callback(null, allowed.includes(origin));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use(apiRateLimiter);
app.use(morgan('dev'));
app.use('/api', routes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use(errorHandler);

export default app;
