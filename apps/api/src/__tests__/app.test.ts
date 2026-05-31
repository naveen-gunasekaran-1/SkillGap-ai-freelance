import { vi, describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';

// Mock the prisma database calls to make integration tests database-independent
vi.mock('../lib/prisma', () => {
  return {
    prisma: {
      $queryRaw: vi.fn().mockImplementation(async (strings: TemplateStringsArray) => {
        const queryStr = strings.join('');
        if (queryStr.includes('information_schema.tables')) {
          return [
            { table_name: 'User' },
            { table_name: 'RefreshToken' },
            { table_name: 'account_tokens' },
            { table_name: 'oauth_accounts' },
            { table_name: 'audit_logs' },
          ];
        }
        if (queryStr.includes('information_schema.columns')) {
          return [
            { column_name: 'failedLoginCount' },
            { column_name: 'lockedUntil' },
            { column_name: 'lastLoginAt' },
            { column_name: 'avatar' },
          ];
        }
        return [{ '1': 1 }];
      }),
    },
  };
});

describe('API Server Integration Tests', () => {
  it('should return 200 OK on health check', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('should return 200 OK and status ready on readiness check', async () => {
    const response = await request(app).get('/ready');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ready');
    expect(response.body.checks.database).toBe('ok');
    expect(response.body.checks.authSchema).toBe('ok');
  });

  it('should return 200 and package name on root endpoint', async () => {
    const response = await request(app).get('/api');
    expect(response.status).toBe(200);
    expect(response.body.name).toBe('skillgap-ai-api');
  });
});
