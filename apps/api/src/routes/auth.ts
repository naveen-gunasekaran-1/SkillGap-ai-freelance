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
import { COMPANY_VERIFICATION_STATUS, ROLE, type Role } from '../lib/constants';
import { stringifyJson, stringifyStringArray } from '../lib/jsonFields';

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

function uniqueSkills(skills: string[]): string[] {
  return Array.from(new Set(skills.map((skill) => skill.trim()).filter(Boolean))).slice(0, 40);
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
      res.status(201).json({ user: toUserDto(user), ...tokens });
      return;
    }

    if (!body.profile && !body.skills?.length) {
      throw new HttpError(400, 'Candidate profile details are required');
    }

    const skills = uniqueSkills(body.profile?.skillLevels.map((s) => s.name) ?? body.skills ?? []);
    const skillLevels =
      body.profile?.skillLevels ?? skills.map((skill) => ({ name: skill, level: 'INTERMEDIATE' as const }));
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
