import 'dotenv/config';
import { env } from './lib/env';
import app from './app';
import { prisma } from './lib/prisma';

const server = app.listen(env.PORT, () => {
  console.log(`SkillGap AI API listening on port ${env.PORT}`);
});

async function shutdown(signal: string): Promise<void> {
  console.log(`${signal} received, shutting down API`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
