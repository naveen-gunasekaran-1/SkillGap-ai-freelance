import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { HttpError } from '../lib/httpError';
import { env } from '../lib/env';

function errorDetails(err: unknown): { errorName?: string; errorMessage?: string } | undefined {
  if (!env.EXPOSE_ERROR_DETAILS) return undefined;
  if (err instanceof Error) {
    return { errorName: err.name, errorMessage: err.message };
  }
  return { errorMessage: String(err) };
}

/**
 * Central API error handler (maps HttpError/ZodError to JSON responses).
 */
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof HttpError) {
    res.status(err.status).json({ message: err.message, code: err.code, requestId: req.requestId });
    return;
  }
  if (err instanceof ZodError) {
    res.status(400).json({
      message: 'Validation failed',
      issues: err.flatten(),
      requestId: req.requestId,
    });
    return;
  }

  console.error({ requestId: req.requestId, err });
  res
    .status(500)
    .json({ message: 'Internal server error', requestId: req.requestId, ...errorDetails(err) });
}
