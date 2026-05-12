import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { HttpError } from '../lib/httpError';

/**
 * Central API error handler (maps HttpError/ZodError to JSON responses).
 */
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof HttpError) {
    res.status(err.status).json({ message: err.message, code: err.code });
    return;
  }
  if (err instanceof ZodError) {
    res.status(400).json({
      message: 'Validation failed',
      issues: err.flatten(),
    });
    return;
  }

  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
}
