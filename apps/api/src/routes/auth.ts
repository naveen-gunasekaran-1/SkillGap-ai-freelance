import { Router, type Request } from 'express';
import { randomBytes } from 'node:crypto';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { hashPassword, verifyPassword } from '../lib/password';
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from '../lib/jwt';
import { hashToken } from '../lib/tokenHash';
import { HttpError } from '../lib/httpError';
import { asyncHandler } from '../lib/asyncHandler';
import { toUserDto } from '../lib/serializers';
import { requireAuth } from '../middleware/auth';
import { authRateLimiter } from '../middleware/rateLimit';
import {
  ACCOUNT_TOKEN_TYPE,
  AUDIT_ACTION,
  COMPANY_VERIFICATION_STATUS,
  ROLE,
  type Role,
} from '../lib/constants';
import { stringifyJson, stringifyStringArray } from '../lib/jsonFields';
import { writeAuditLog } from '../lib/audit';
import {
  consumeAccountToken,
  createAccountToken,
  sendEmailVerificationEmail,
  sendPasswordResetEmail,
} from '../lib/accountTokens';
import {
  createOAuthAuthorizationUrl,
  exchangeOAuthCode,
  parseOAuthProvider,
  verifyOAuthState,
  type OAuthProfile,
} from '../lib/oauth';
import { env } from '../lib/env';

const skillLevelSchema = z.object({
  name: z.string().min(1).max(64),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']),
});

const educationSchema = z.object({
  school: z.string().min(1).max(160),
  degree: z.string().min(1).max(120),
  field: z.string().max(120).optional(),
  startYear: z.number().int().min(1980).max(2100),
  endYear: z.number().int().min(1980).max(2100).optional(),
  gpa: z.string().max(12).optional(),
});

const experienceSchema = z.object({
  company: z.string().min(1).max(160),
  role: z.string().min(1).max(120),
  startDate: z.string().min(4).max(24),
  endDate: z.string().min(4).max(24).optional(),
  summary: z.string().max(800).optional(),
  bullets: z.array(z.string().min(1).max(220)).max(8).optional(),
});

const internshipSchema = z.object({
  company: z.string().min(1).max(160),
  role: z.string().min(1).max(120),
  startDate: z.string().min(4).max(24),
  endDate: z.string().min(4).max(24).optional(),
  summary: z.string().max(600).optional(),
});

const projectSchema = z.object({
  name: z.string().min(1).max(160),
  stack: z.array(z.string().min(1).max(40)).min(1).max(20),
  link: z.string().url().max(300).optional(),
  summary: z.string().max(600).optional(),
});

const linkSchema = z.object({
  label: z.string().min(2).max(40),
  url: z.string().url().max(300),
});

const candidateProfileSchema = z.object({
  title: z.string().min(2).max(120),
  location: z.string().min(2).max(120),
  summary: z.string().min(20).max(600),
  phone: z.string().min(7).max(40).optional(),
  skillLevels: z.array(skillLevelSchema).min(1).max(40),
  education: z.array(educationSchema).min(1).max(10),
  internships: z.array(internshipSchema).min(1).max(10),
  experience: z.array(experienceSchema).max(20).optional(),
  projects: z.array(projectSchema).max(20).optional(),
  links: z.array(linkSchema).min(1).max(8),
  resumeUrl: z.string().url().max(500),
});

const registerSchema = z.object({
  role: z.enum([ROLE.CANDIDATE, ROLE.COMPANY]),
  name: z.string().min(1).max(120),
  email: z.string().email().max(254),
  password: z.string().min(8).max(128),
  profile: candidateProfileSchema.optional(),
  skills: z.array(z.string().min(1).max(64)).min(1).max(40).optional(),
  company: z
    .object({
      name: z.string().min(1).max(160),
      industry: z.string().min(1).max(120),
      website: z.string().url().max(200).optional(),
    })
    .optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(128),
  rememberMe: z.boolean().optional().default(false),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(10),
});

const forgotPasswordSchema = z.object({
  email: z.string().email().max(254),
});

const resetPasswordSchema = z.object({
  token: z.string().min(32),
  password: z.string().min(8).max(128),
});

const tokenSchema = z.object({
  token: z.string().min(32),
});

const oauthSessionSchema = z.object({
  code: z.string().min(32),
  rememberMe: z.boolean().optional().default(true),
});

const router = Router();

router.use(authRateLimiter);

const MAX_FAILED_LOGIN_ATTEMPTS = 5;
const LOGIN_LOCKOUT_MS = 15 * 60 * 1000;

async function issueTokens(
  userId: string,
  role: Role,
  rememberMe = true,
): Promise<{ accessToken: string; refreshToken: string }> {
  const accessToken = signAccessToken({ sub: userId, role });
  const refreshToken = signRefreshToken();
  const tokenHash = hashToken(refreshToken);
  const expiresAt = new Date(
    Date.now() + (rememberMe ? 1000 * 60 * 60 * 24 * 30 : 1000 * 60 * 60 * 12),
  );
  await prisma.refreshToken.create({
    data: { tokenHash, userId, expiresAt },
  });
  return { accessToken, refreshToken };
}

function uniqueSkills(skills: string[]): string[] {
  return Array.from(new Set(skills.map((skill) => skill.trim()).filter(Boolean))).slice(0, 40);
}

function safeReturnTo(value?: string): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/dashboard';
  return value;
}

function oauthCallbackUrl(client: 'web' | 'mobile' | undefined): URL {
  const base =
    client === 'mobile' ? env.MOBILE_APP_URL : `${env.APP_URL.replace(/\/$/, '')}/oauth/callback`;
  return new URL(base);
}

function secondsUntil(date: Date): number {
  return Math.max(1, Math.ceil((date.getTime() - Date.now()) / 1000));
}

async function recordFailedLogin(user: { id: string; failedLoginCount: number }): Promise<{
  failedLoginCount: number;
  lockedUntil: Date | null;
}> {
  const nextCount = user.failedLoginCount + 1;
  const shouldLock = nextCount >= MAX_FAILED_LOGIN_ATTEMPTS;
  return prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginCount: nextCount,
      ...(shouldLock ? { lockedUntil: new Date(Date.now() + LOGIN_LOCKOUT_MS) } : {}),
    },
    select: { failedLoginCount: true, lockedUntil: true },
  });
}

async function recordSuccessfulLogin(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      failedLoginCount: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
    },
  });
}

async function sendVerificationEmailBestEffort(input: {
  req: Request;
  user: { id: string; email: string; name: string; role: string };
}): Promise<void> {
  try {
    const verificationToken = await createAccountToken({
      userId: input.user.id,
      type: ACCOUNT_TOKEN_TYPE.EMAIL_VERIFICATION,
    });
    await sendEmailVerificationEmail({
      email: input.user.email,
      name: input.user.name,
      token: verificationToken,
    });
    await writeAuditLog({
      req: input.req,
      actorId: input.user.id,
      actorRole: input.user.role,
      action: AUDIT_ACTION.AUTH_EMAIL_VERIFICATION_SENT,
      entityType: 'User',
      entityId: input.user.id,
    });
  } catch (error) {
    console.error({
      requestId: input.req.requestId,
      userId: input.user.id,
      err: error,
      message: 'Email verification dispatch failed',
    });
  }
}

async function findOrCreateOAuthUser(
  profile: OAuthProfile,
  role: Role,
): Promise<{
  id: string;
  email: string;
  name: string;
  role: string;
}> {
  const linked = await prisma.oAuthAccount.findUnique({
    where: {
      provider_providerAccountId: {
        provider: profile.provider,
        providerAccountId: profile.providerAccountId,
      },
    },
    include: { user: true },
  });
  if (linked) {
    if (profile.avatar && profile.avatar !== linked.user.avatar) {
      return prisma.user.update({
        where: { id: linked.user.id },
        data: { avatar: profile.avatar },
      });
    }
    return linked.user;
  }

  const existing = await prisma.user.findUnique({ where: { email: profile.email } });
  if (existing) {
    await prisma.oAuthAccount.create({
      data: {
        provider: profile.provider,
        providerAccountId: profile.providerAccountId,
        email: profile.email,
        userId: existing.id,
      },
    });
    const data: { emailVerified?: boolean; avatar?: string } = {};
    if (profile.emailVerified && !existing.emailVerified) {
      data.emailVerified = true;
    }
    if (profile.avatar && profile.avatar !== existing.avatar) {
      data.avatar = profile.avatar;
    }
    if (Object.keys(data).length > 0) {
      return prisma.user.update({ where: { id: existing.id }, data });
    }
    return existing;
  }

  const passwordHash = await hashPassword(randomBytes(32).toString('base64url'));
  const company =
    role === ROLE.COMPANY
      ? await prisma.company.create({
          data: {
            name: `${profile.name}'s Company`,
            industry: 'Technology',
            size: '1-50',
            isVerified: false,
            verificationStatus: COMPANY_VERIFICATION_STATUS.NOT_STARTED,
          },
        })
      : null;
  const user = await prisma.user.create({
    data: {
      email: profile.email,
      passwordHash,
      name: profile.name,
      role,
      title: role === ROLE.COMPANY ? 'Company recruiter' : 'Candidate',
      ...(company ? { companyId: company.id } : {}),
      location: '',
      summary: '',
      ...(profile.avatar ? { avatar: profile.avatar } : {}),
      skillsJson: stringifyStringArray([]),
      emailVerified: profile.emailVerified,
      skillsVerified: false,
      oauthAccounts: {
        create: {
          provider: profile.provider,
          providerAccountId: profile.providerAccountId,
          email: profile.email,
        },
      },
    },
  });
  return user;
}

router.get(
  '/oauth/:provider/start',
  asyncHandler(async (req, res) => {
    const provider = parseOAuthProvider(String(req.params.provider));
    const query = z
      .object({
        returnTo: z.string().optional(),
        role: z.enum([ROLE.CANDIDATE, ROLE.COMPANY]).optional(),
        client: z.enum(['web', 'mobile']).optional().default('web'),
      })
      .parse(req.query);
    const authorizationUrl = createOAuthAuthorizationUrl({
      provider,
      returnTo: safeReturnTo(query.returnTo),
      ...(query.role ? { role: query.role } : {}),
      client: query.client,
    });
    res.redirect(authorizationUrl);
  }),
);

router.get(
  '/oauth/:provider/callback',
  asyncHandler(async (req, res) => {
    const provider = parseOAuthProvider(String(req.params.provider));
    const query = z
      .object({
        code: z.string().min(1).optional(),
        state: z.string().min(1).optional(),
        error: z.string().optional(),
      })
      .parse(req.query);

    let state: ReturnType<typeof verifyOAuthState> | null = null;
    if (query.state) {
      state = verifyOAuthState(query.state, provider);
    }

    if (query.error || !query.code || !state) {
      const redirect = oauthCallbackUrl(state?.client);
      redirect.searchParams.set('error', query.error ?? 'oauth_failed');
      res.redirect(redirect.toString());
      return;
    }

    try {
      const profile = await exchangeOAuthCode(provider, query.code);
      const user = await findOrCreateOAuthUser(profile, state.role ?? ROLE.CANDIDATE);
      await recordSuccessfulLogin(user.id);
      const loginCode = await createAccountToken({
        userId: user.id,
        type: ACCOUNT_TOKEN_TYPE.OAUTH_LOGIN,
      });
      await writeAuditLog({
        req,
        actorId: user.id,
        actorRole: user.role,
        action: AUDIT_ACTION.AUTH_OAUTH_LOGIN_SUCCESS,
        entityType: 'User',
        entityId: user.id,
        metadata: { provider },
      });
      const redirect = oauthCallbackUrl(state.client);
      redirect.searchParams.set('code', loginCode);
      redirect.searchParams.set('returnTo', safeReturnTo(state.returnTo));
      res.redirect(redirect.toString());
    } catch (error) {
      const redirect = oauthCallbackUrl(state.client);
      redirect.searchParams.set(
        'error',
        error instanceof HttpError ? (error.code ?? 'oauth_failed') : 'oauth_failed',
      );
      res.redirect(redirect.toString());
    }
  }),
);

router.post(
  '/oauth/session',
  asyncHandler(async (req, res) => {
    const body = oauthSessionSchema.parse(req.body);
    let consumed: { userId: string; tokenId: string };
    try {
      consumed = await consumeAccountToken({
        token: body.code,
        type: ACCOUNT_TOKEN_TYPE.OAUTH_LOGIN,
      });
    } catch {
      throw new HttpError(400, 'Invalid or expired OAuth login code');
    }
    const user = await prisma.user.findUnique({ where: { id: consumed.userId } });
    if (!user) {
      throw new HttpError(401, 'User not found');
    }
    await recordSuccessfulLogin(user.id);
    const tokens = await issueTokens(user.id, user.role as Role, body.rememberMe);
    res.json({ user: toUserDto(user), ...tokens });
  }),
);

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const body = registerSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
    if (existing) {
      throw new HttpError(409, 'Email already registered');
    }

    const passwordHash = await hashPassword(body.password);

    if (body.role === ROLE.COMPANY) {
      if (!body.company) {
        throw new HttpError(400, 'Company details are required for company accounts');
      }
      const company = await prisma.company.create({
        data: {
          name: body.company.name,
          industry: body.company.industry,
          size: '1-50',
          isVerified: false,
          verificationStatus: COMPANY_VERIFICATION_STATUS.NOT_STARTED,
          ...(body.company.website ? { website: body.company.website } : {}),
        },
      });
      const user = await prisma.user.create({
        data: {
          email: body.email.toLowerCase(),
          passwordHash,
          name: body.name,
          role: ROLE.COMPANY,
          companyId: company.id,
          skillsJson: stringifyStringArray([]),
        },
      });
      const tokens = await issueTokens(user.id, user.role as Role);
      await sendVerificationEmailBestEffort({ req, user });
      res.status(201).json({ user: toUserDto(user), ...tokens });
      return;
    }

    if (!body.profile && !body.skills?.length) {
      throw new HttpError(400, 'Candidate profile details are required');
    }

    const skills = uniqueSkills(body.profile?.skillLevels.map((s) => s.name) ?? body.skills ?? []);
    const skillLevels =
      body.profile?.skillLevels ??
      skills.map((skill) => ({ name: skill, level: 'INTERMEDIATE' as const }));
    const education = body.profile?.education ?? [];
    const internships = body.profile?.internships ?? [];
    const links = body.profile?.links ?? [];

    const user = await prisma.user.create({
      data: {
        email: body.email.toLowerCase(),
        passwordHash,
        name: body.name,
        role: ROLE.CANDIDATE,
        title: body.profile?.title ?? 'Candidate',
        location: body.profile?.location ?? '',
        summary: body.profile?.summary ?? '',
        ...(body.profile?.phone ? { phone: body.profile.phone } : {}),
        skillsJson: stringifyStringArray(skills),
        skillLevelsJson: stringifyJson(skillLevels),
        educationJson: stringifyJson(education),
        experienceJson: stringifyJson(body.profile?.experience ?? []),
        internshipsJson: stringifyJson(internships),
        projectsJson: stringifyJson(body.profile?.projects ?? []),
        linksJson: stringifyJson(links),
        ...(body.profile?.resumeUrl ? { resumeUrl: body.profile.resumeUrl } : {}),
        resumeStatus: 'PENDING',
        emailVerified: false,
        skillsVerified: false,
      },
    });

    const tokens = await issueTokens(user.id, user.role as Role, true);
    await sendVerificationEmailBestEffort({ req, user });
    res.status(201).json({ user: toUserDto(user), ...tokens });
  }),
);

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const body = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
    if (!user) {
      await writeAuditLog({
        req,
        action: AUDIT_ACTION.AUTH_LOGIN_FAILED,
        entityType: 'User',
        metadata: { email: body.email.toLowerCase(), reason: 'USER_NOT_FOUND' },
      });
      throw new HttpError(401, 'Invalid email or password');
    }
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      await writeAuditLog({
        req,
        action: AUDIT_ACTION.AUTH_LOGIN_FAILED,
        entityType: 'User',
        entityId: user.id,
        metadata: {
          email: user.email,
          reason: 'ACCOUNT_LOCKED',
          retryAfterSeconds: secondsUntil(user.lockedUntil),
        },
      });
      throw new HttpError(
        423,
        `Account is temporarily locked. Try again in ${secondsUntil(user.lockedUntil)} seconds.`,
        'ACCOUNT_LOCKED',
      );
    }
    const ok = await verifyPassword(body.password, user.passwordHash);
    if (!ok) {
      const updated = await recordFailedLogin(user);
      await writeAuditLog({
        req,
        action: AUDIT_ACTION.AUTH_LOGIN_FAILED,
        entityType: 'User',
        entityId: user.id,
        metadata: {
          email: user.email,
          reason: 'BAD_PASSWORD',
          failedLoginCount: updated.failedLoginCount,
          lockedUntil: updated.lockedUntil?.toISOString(),
        },
      });
      if (updated.lockedUntil && updated.lockedUntil > new Date()) {
        throw new HttpError(
          423,
          `Too many failed login attempts. Try again in ${secondsUntil(updated.lockedUntil)} seconds.`,
          'ACCOUNT_LOCKED',
        );
      }
      throw new HttpError(401, 'Invalid email or password');
    }
    await recordSuccessfulLogin(user.id);
    const tokens = await issueTokens(user.id, user.role as Role, body.rememberMe);
    await writeAuditLog({
      req,
      actorId: user.id,
      actorRole: user.role,
      action: AUDIT_ACTION.AUTH_LOGIN_SUCCESS,
      entityType: 'User',
      entityId: user.id,
      metadata: { rememberMe: body.rememberMe, loginMethod: 'password' },
    });
    res.json({ user: toUserDto(user), ...tokens });
  }),
);

router.post(
  '/forgot-password',
  asyncHandler(async (req, res) => {
    const body = forgotPasswordSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
    if (user) {
      const token = await createAccountToken({
        userId: user.id,
        type: ACCOUNT_TOKEN_TYPE.PASSWORD_RESET,
      });
      await sendPasswordResetEmail({ email: user.email, name: user.name, token });
      await writeAuditLog({
        req,
        actorId: user.id,
        actorRole: user.role,
        action: AUDIT_ACTION.AUTH_PASSWORD_RESET_REQUESTED,
        entityType: 'User',
        entityId: user.id,
      });
    } else {
      await writeAuditLog({
        req,
        action: AUDIT_ACTION.AUTH_PASSWORD_RESET_REQUESTED,
        entityType: 'User',
        metadata: { email: body.email.toLowerCase(), found: false },
      });
    }
    res.json({ ok: true });
  }),
);

router.post(
  '/reset-password',
  asyncHandler(async (req, res) => {
    const body = resetPasswordSchema.parse(req.body);
    let consumed: { userId: string; tokenId: string };
    try {
      consumed = await consumeAccountToken({
        token: body.token,
        type: ACCOUNT_TOKEN_TYPE.PASSWORD_RESET,
      });
    } catch {
      throw new HttpError(400, 'Invalid or expired password reset link');
    }

    const passwordHash = await hashPassword(body.password);
    const user = await prisma.user.update({
      where: { id: consumed.userId },
      data: { passwordHash },
    });
    await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
    await writeAuditLog({
      req,
      actorId: user.id,
      actorRole: user.role,
      action: AUDIT_ACTION.AUTH_PASSWORD_RESET_COMPLETED,
      entityType: 'User',
      entityId: user.id,
      metadata: { tokenId: consumed.tokenId },
    });
    res.json({ ok: true });
  }),
);

router.post(
  '/email-verification/send',
  requireAuth(),
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.auth!.id } });
    if (!user) {
      throw new HttpError(401, 'User not found');
    }
    if (user.emailVerified) {
      res.json({ ok: true, alreadyVerified: true });
      return;
    }
    const token = await createAccountToken({
      userId: user.id,
      type: ACCOUNT_TOKEN_TYPE.EMAIL_VERIFICATION,
    });
    await sendEmailVerificationEmail({ email: user.email, name: user.name, token });
    await writeAuditLog({
      req,
      actorId: user.id,
      actorRole: user.role,
      action: AUDIT_ACTION.AUTH_EMAIL_VERIFICATION_SENT,
      entityType: 'User',
      entityId: user.id,
    });
    res.json({ ok: true });
  }),
);

router.post(
  '/email-verification/confirm',
  asyncHandler(async (req, res) => {
    const body = tokenSchema.parse(req.body);
    let consumed: { userId: string; tokenId: string };
    try {
      consumed = await consumeAccountToken({
        token: body.token,
        type: ACCOUNT_TOKEN_TYPE.EMAIL_VERIFICATION,
      });
    } catch {
      throw new HttpError(400, 'Invalid or expired email verification link');
    }
    const user = await prisma.user.update({
      where: { id: consumed.userId },
      data: { emailVerified: true },
    });
    await writeAuditLog({
      req,
      actorId: user.id,
      actorRole: user.role,
      action: AUDIT_ACTION.AUTH_EMAIL_VERIFIED,
      entityType: 'User',
      entityId: user.id,
      metadata: { tokenId: consumed.tokenId },
    });
    res.json({ ok: true, user: toUserDto(user) });
  }),
);

router.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const body = refreshSchema.parse(req.body);
    verifyRefreshToken(body.refreshToken);
    const tokenHash = hashToken(body.refreshToken);
    const existing = await prisma.refreshToken.findUnique({ where: { tokenHash } });
    if (!existing || existing.expiresAt < new Date()) {
      throw new HttpError(401, 'Invalid refresh token');
    }
    const user = await prisma.user.findUnique({ where: { id: existing.userId } });
    if (!user) {
      throw new HttpError(401, 'Invalid refresh token');
    }

    await prisma.refreshToken.delete({ where: { id: existing.id } });
    const tokens = await issueTokens(user.id, user.role as Role);
    await writeAuditLog({
      req,
      actorId: user.id,
      actorRole: user.role,
      action: AUDIT_ACTION.AUTH_TOKEN_REFRESHED,
      entityType: 'RefreshToken',
      entityId: existing.id,
    });
    res.json({ user: toUserDto(user), ...tokens });
  }),
);

router.post(
  '/logout',
  asyncHandler(async (req, res) => {
    const body = refreshSchema.partial().parse(req.body);
    if (body.refreshToken) {
      verifyRefreshToken(body.refreshToken);
      const tokenHash = hashToken(body.refreshToken);
      await prisma.refreshToken.deleteMany({ where: { tokenHash } });
      await writeAuditLog({
        req,
        action: AUDIT_ACTION.AUTH_LOGOUT,
        entityType: 'RefreshToken',
      });
    }
    res.status(204).send();
  }),
);

router.get(
  '/me',
  requireAuth(),
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.auth!.id } });
    if (!user) {
      throw new HttpError(401, 'User not found');
    }
    res.json({ user: toUserDto(user) });
  }),
);

router.post(
  '/introspect',
  asyncHandler(async (req, res) => {
    const schema = z.object({ accessToken: z.string().min(10) });
    const { accessToken } = schema.parse(req.body);
    try {
      const payload = verifyAccessToken(accessToken);
      const user = await prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user) {
        res.json({ valid: false });
        return;
      }
      res.json({ valid: true, user: toUserDto(user) });
    } catch {
      res.json({ valid: false });
    }
  }),
);

export default router;
