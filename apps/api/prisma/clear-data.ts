import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function orderedDeletes(db: PrismaClient): Array<[string, () => Promise<{ count: number }>]> {
  return [
    ['skill embeddings', () => db.skillEmbedding.deleteMany()],
    ['admin reviews', () => db.adminReview.deleteMany()],
    ['fraud flags', () => db.fraudFlag.deleteMany()],
    ['verification documents', () => db.verificationDocument.deleteMany()],
    ['company verifications', () => db.companyVerification.deleteMany()],
    ['audit logs', () => db.auditLog.deleteMany()],
    ['recruiter activity logs', () => db.recruiterActivityLog.deleteMany()],
    ['cookie consents', () => db.cookieConsent.deleteMany()],
    ['legal acceptances', () => db.legalAcceptance.deleteMany()],
    ['AI explanations', () => db.aiExplanation.deleteMany()],
    ['applications', () => db.application.deleteMany()],
    ['job skills', () => db.jobSkill.deleteMany()],
    ['jobs', () => db.job.deleteMany()],
    ['account tokens', () => db.accountToken.deleteMany()],
    ['OAuth accounts', () => db.oAuthAccount.deleteMany()],
    ['refresh tokens', () => db.refreshToken.deleteMany()],
    ['users', () => db.user.deleteMany()],
    ['companies', () => db.company.deleteMany()],
    ['skills', () => db.skill.deleteMany()],
  ];
}

export async function clearDatabase(
  options: { skipConfirmation?: boolean } = {},
  db: PrismaClient = prisma,
): Promise<void> {
  const confirmed = options.skipConfirmation || process.argv.includes('--yes');
  const allowProduction = process.argv.includes('--allow-production');

  if (!confirmed) {
    throw new Error('Refusing to clear data. Re-run with --yes to confirm.');
  }

  if (process.env.NODE_ENV === 'production' && !allowProduction) {
    throw new Error(
      'Refusing to clear production data. Re-run with --yes --allow-production only if this is intentional.',
    );
  }

  for (const [label, deleteMany] of orderedDeletes(db)) {
    const result = await deleteMany();
    console.log(`Deleted ${result.count} ${label}`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  clearDatabase()
    .then(async () => {
      console.log('Database clear complete.');
      await prisma.$disconnect();
    })
    .catch(async (error) => {
      console.error(error);
      await prisma.$disconnect();
      process.exit(1);
    });
}
