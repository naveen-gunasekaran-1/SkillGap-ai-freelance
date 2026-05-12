import { createHash } from 'node:crypto';

/**
 * Hash a bearer token for persistence (refresh tokens stored as hashes only).
 */
export function hashToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex');
}
