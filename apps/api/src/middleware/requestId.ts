import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

export function requestId(req: Request, res: Response, next: NextFunction): void {
  const header = req.get('x-request-id');
  req.requestId = header && header.length <= 128 ? header : randomUUID();
  res.setHeader('x-request-id', req.requestId);
  next();
}
