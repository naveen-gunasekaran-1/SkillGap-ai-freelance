import { randomUUID } from 'node:crypto';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from './env';

export interface AccessPayload {
  sub: string;
  role: string;
}

/**
 * Sign a short-lived access token (JWT).
 */
export function signAccessToken(payload: AccessPayload): string {
  const options: SignOptions = {
    expiresIn: env.JWT_ACCESS_EXPIRES as NonNullable<SignOptions['expiresIn']>,
  };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, options);
}

/**
 * Sign a long-lived refresh token (opaque to client, verified via DB hash).
 */
export function signRefreshToken(): string {
  const options: SignOptions = {
    expiresIn: env.JWT_REFRESH_EXPIRES as NonNullable<SignOptions['expiresIn']>,
  };
  return jwt.sign({ typ: 'refresh', jti: randomUUID() }, env.JWT_REFRESH_SECRET, options);
}

/**
 * Verify access token and return payload.
 */
export function verifyAccessToken(token: string): AccessPayload {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
  if (
    typeof decoded !== 'object' ||
    decoded === null ||
    !('sub' in decoded) ||
    !('role' in decoded)
  ) {
    throw new Error('Invalid access token payload');
  }
  return { sub: String(decoded.sub), role: String(decoded.role) };
}

/**
 * Verify refresh token shape/expiry (caller still validates against DB).
 */
export function verifyRefreshToken(token: string): { jti: string } {
  const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);
  if (typeof decoded !== 'object' || decoded === null || !('jti' in decoded)) {
    throw new Error('Invalid refresh token payload');
  }
  return { jti: String(decoded.jti) };
}
