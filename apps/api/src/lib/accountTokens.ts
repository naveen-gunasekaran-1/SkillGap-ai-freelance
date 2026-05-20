import { randomBytes } from 'node:crypto';
import { prisma } from './prisma';
import { hashToken } from './tokenHash';
import { env } from './env';
import { sendEmail } from './email';
import { ACCOUNT_TOKEN_TYPE, type AccountTokenType } from './constants';

const PASSWORD_RESET_TTL_MS = 1000 * 60 * 30;
const EMAIL_VERIFICATION_TTL_MS = 1000 * 60 * 60 * 24;
const OAUTH_LOGIN_TTL_MS = 1000 * 60 * 5;

function createRawToken(): string {
  return randomBytes(32).toString('base64url');
}

function tokenTtl(type: AccountTokenType): number {
  if (type === ACCOUNT_TOKEN_TYPE.PASSWORD_RESET) return PASSWORD_RESET_TTL_MS;
  if (type === ACCOUNT_TOKEN_TYPE.OAUTH_LOGIN) return OAUTH_LOGIN_TTL_MS;
  return EMAIL_VERIFICATION_TTL_MS;
}

export async function createAccountToken(input: {
  userId: string;
  type: AccountTokenType;
}): Promise<string> {
  const rawToken = createRawToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + tokenTtl(input.type));

  await prisma.accountToken.updateMany({
    where: { userId: input.userId, type: input.type, usedAt: null },
    data: { usedAt: new Date() },
  });

  await prisma.accountToken.create({
    data: {
      userId: input.userId,
      type: input.type,
      tokenHash,
      expiresAt,
    },
  });

  return rawToken;
}

export async function consumeAccountToken(input: {
  token: string;
  type: AccountTokenType;
}): Promise<{ userId: string; tokenId: string }> {
  const tokenHash = hashToken(input.token);
  const existing = await prisma.accountToken.findUnique({ where: { tokenHash } });
  if (
    !existing ||
    existing.type !== input.type ||
    existing.usedAt ||
    existing.expiresAt < new Date()
  ) {
    throw new Error('INVALID_ACCOUNT_TOKEN');
  }

  await prisma.accountToken.update({
    where: { id: existing.id },
    data: { usedAt: new Date() },
  });

  return { userId: existing.userId, tokenId: existing.id };
}

export async function sendPasswordResetEmail(input: {
  email: string;
  name: string;
  token: string;
}): Promise<void> {
  const url = `${env.APP_URL.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(input.token)}`;
  await sendEmail({
    to: input.email,
    subject: 'Reset your SkillGap AI password',
    text: `Hi ${input.name}, reset your SkillGap AI password here: ${url}. This link expires in 30 minutes.`,
    html: `
      <p>Hi ${input.name},</p>
      <p>Use the link below to reset your SkillGap AI password. It expires in 30 minutes.</p>
      <p><a href="${url}">Reset password</a></p>
      <p>If you did not request this, you can ignore this email.</p>
    `,
  });
}

export async function sendEmailVerificationEmail(input: {
  email: string;
  name: string;
  token: string;
}): Promise<void> {
  const url = `${env.APP_URL.replace(/\/$/, '')}/verify-email?token=${encodeURIComponent(input.token)}`;
  await sendEmail({
    to: input.email,
    subject: 'Verify your SkillGap AI email',
    text: `Hi ${input.name}, verify your SkillGap AI email here: ${url}. This link expires in 24 hours.`,
    html: `
      <p>Hi ${input.name},</p>
      <p>Verify your email address to keep your SkillGap AI account secure.</p>
      <p><a href="${url}">Verify email</a></p>
      <p>This link expires in 24 hours.</p>
    `,
  });
}
