import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.spec.ts', 'src/__tests__/**/*.test.ts'],
    env: {
      DATABASE_URL: 'postgresql://localhost:5432/test',
      JWT_ACCESS_SECRET: 'test_access_secret_32_characters_minimum',
      JWT_REFRESH_SECRET: 'test_refresh_secret_32_characters_minimum',
      PORT: '3001',
      APP_URL: 'http://localhost:5173',
      API_URL: 'http://localhost:3001',
      CORS_ORIGINS: 'http://localhost:5173',
    },
  },
});
