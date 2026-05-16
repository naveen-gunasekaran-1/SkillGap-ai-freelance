import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { ROLE } from '../src/lib/constants';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) {
    throw new Error('Usage: pnpm --filter @skillgap/api admin:promote user@example.com');
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error(`No user found with email: ${email}`);
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { role: ROLE.ADMIN, companyId: null },
  });

  await prisma.auditLog.create({
    data: {
      actorRole: ROLE.ADMIN,
      action: 'ADMIN_USER_PROMOTED',
      entityType: 'User',
      entityId: updated.id,
      metadataJson: { email: updated.email },
    },
  });

  console.log(`Promoted ${updated.email} to ADMIN`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
