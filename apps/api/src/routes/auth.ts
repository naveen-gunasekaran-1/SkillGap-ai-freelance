import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { hashPassword, verifyPassword } from '../lib/password';
import { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } from '../lib/jwt';
import { hashToken } from '../lib/tokenHash';
import { HttpError } from '../lib/httpError';
import { asyncHandler } from '../lib/asyncHandler';
import { toUserDto } from '../lib/serializers';
import { requireAuth } from '../middleware/auth';
import { authRateLimiter } from '../middleware/rateLimit';
import { ROLE, type Role } from '../lib/constants';
import { stringifyStringArray } from '../lib/jsonFields';

const registerSchema = z.object({
  role: z.enum([ROLE.CANDIDATE, ROLE.COMPANY]),
  name: z.string().min(1).max(120),
  email: z.string().email().max(254),
  password: z.string().min(8).max(128),
  skills: z.array(z.string().min(1).max(64)).max(40).optional(),
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
});

const refreshSchema = z.object({
  refreshToken: z.string().min(10),
});

const router = Router();

router.use(authRateLimiter);

async function issueTokens(userId: string, role: Role): Promise<{ accessToken: string; refreshToken: string }> {
  const accessToken = signAccessToken({ sub: userId, role });
  const refreshToken = signRefreshToken();
  const tokenHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
  await prisma.refreshToken.create({
    data: { tokenHash, userId, expiresAt },
  });
  return { accessToken, refreshToken };
}

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
          isVerified: true,
          verificationBadge: 'MANUAL',
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
      res.status(201).json({ user: toUserDto(user), ...tokens });
      return;
    }

    const user = await prisma.user.create({
      data: {
        email: body.email.toLowerCase(),
        passwordHash,
        name: body.name,
        role: ROLE.CANDIDATE,
        skillsJson: stringifyStringArray(body.skills ?? []),
      },
    });

    const tokens = await issueTokens(user.id, user.role as Role);
    res.status(201).json({ user: toUserDto(user), ...tokens });
  }),
);

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const body = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
    if (!user) {
      throw new HttpError(401, 'Invalid email or password');
    }
    const ok = await verifyPassword(body.password, user.passwordHash);
    if (!ok) {
      throw new HttpError(401, 'Invalid email or password');
    }
    const tokens = await issueTokens(user.id, user.role as Role);
    res.json({ user: toUserDto(user), ...tokens });
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
