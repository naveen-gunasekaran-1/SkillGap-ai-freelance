import { Router } from 'express';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../lib/asyncHandler';
import { HttpError } from '../lib/httpError';
import { toJobDto } from '../lib/serializers';
import { computeMatchScore } from '../lib/matching';
import {
  optionalAuth,
  requireAuth,
  requireRoles,
  requireVerifiedCompany,
} from '../middleware/auth';
import { AUDIT_ACTION, JOB_TYPE, ROLE, type JobType } from '../lib/constants';
import { stringifyStringArray } from '../lib/jsonFields';
import { writeAuditLog } from '../lib/audit';
import { paginationMeta, paginationSchema } from '../lib/pagination';

const listQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
  type: z.string().optional(),
  verified: z.enum(['true', 'false']).optional(),
});

const router = Router();

const jobPayloadSchema = z.object({
  title: z.string().min(2).max(160),
  description: z.string().min(10).max(5000),
  location: z.string().min(2).max(160),
  type: z.enum([JOB_TYPE.FULL_TIME, JOB_TYPE.PART_TIME, JOB_TYPE.INTERNSHIP, JOB_TYPE.CONTRACT]),
  salaryMin: z.number().int().nonnegative().optional(),
  salaryMax: z.number().int().nonnegative().optional(),
  requirements: z.array(z.string().min(1).max(300)).min(1).max(30),
  responsibilities: z.array(z.string().min(1).max(300)).max(30).optional(),
  skillNames: z.array(z.string().min(1).max(64)).min(1).max(40),
  expiresAt: z.string().datetime().optional(),
});

function parseJobTypes(raw?: string): JobType[] | undefined {
  if (!raw) return undefined;
  const parts = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const allowed = new Set<string>(Object.values(JOB_TYPE));
  const out = parts.filter((p) => allowed.has(p)) as JobType[];
  return out.length ? out : undefined;
}

router.get(
  '/',
  optionalAuth(),
  asyncHandler(async (req, res) => {
    const q = listQuerySchema.parse(req.query);
    const types = parseJobTypes(q.type);

    const clauses: Prisma.JobWhereInput[] = [];
    if (types && types.length > 0) {
      clauses.push({ type: { in: types } });
    }
    if (q.verified === 'true') {
      clauses.push({ isVerified: true });
    }
    if (q.search && q.search.trim().length > 0) {
      const s = q.search.trim();
      clauses.push({
        OR: [
          { title: { contains: s } },
          { company: { name: { contains: s } } },
          { description: { contains: s } },
        ],
      });
    }

    const where: Prisma.JobWhereInput = clauses.length > 0 ? { AND: clauses } : {};
    const skip = (q.page - 1) * q.limit;

    const [jobs, total] = await prisma.$transaction([
      prisma.job.findMany({
        where,
        orderBy: { postedAt: 'desc' },
        skip,
        take: q.limit,
        include: {
          company: true,
          skills: { include: { skill: true } },
        },
      }),
      prisma.job.count({ where }),
    ]);

    const candidateSkills =
      req.auth?.role === ROLE.CANDIDATE || req.auth?.role === ROLE.ADMIN ? req.auth.skills : [];

    const payload = jobs.map((job) => {
      const skillNames = job.skills.map((js) => js.skill.name);
      const matchScore =
        req.auth && (req.auth.role === ROLE.CANDIDATE || req.auth.role === ROLE.ADMIN)
          ? computeMatchScore(candidateSkills, skillNames)
          : undefined;
      return toJobDto(job, matchScore);
    });

    res.json({
      jobs: payload,
      pagination: paginationMeta({ page: q.page, limit: q.limit, total }),
    });
  }),
);

router.get(
  '/company/mine',
  requireAuth(),
  requireRoles(ROLE.COMPANY, ROLE.ADMIN),
  asyncHandler(async (req, res) => {
    const q = paginationSchema.parse(req.query);
    if (!req.auth!.companyId) {
      throw new HttpError(400, 'Company profile is not linked');
    }
    const where = { companyId: req.auth!.companyId };
    const [jobs, total] = await prisma.$transaction([
      prisma.job.findMany({
        where,
        orderBy: { postedAt: 'desc' },
        skip: (q.page - 1) * q.limit,
        take: q.limit,
        include: {
          company: true,
          skills: { include: { skill: true } },
          _count: { select: { applications: true } },
        },
      }),
      prisma.job.count({ where }),
    ]);
    res.json({
      jobs: jobs.map((job) => ({
        ...toJobDto(job),
        applicantCount: job._count.applications,
      })),
      pagination: paginationMeta({ page: q.page, limit: q.limit, total }),
    });
  }),
);

router.post(
  '/',
  requireAuth(),
  requireRoles(ROLE.COMPANY, ROLE.ADMIN),
  requireVerifiedCompany(),
  asyncHandler(async (req, res) => {
    if (!req.auth!.companyId) {
      throw new HttpError(400, 'Company profile is not linked');
    }
    const body = jobPayloadSchema.parse(req.body);
    const job = await prisma.job.create({
      data: {
        companyId: req.auth!.companyId,
        title: body.title,
        description: body.description,
        location: body.location,
        type: body.type,
        isVerified: true,
        ...(body.salaryMin != null ? { salaryMin: body.salaryMin } : {}),
        ...(body.salaryMax != null ? { salaryMax: body.salaryMax } : {}),
        requirementsJson: stringifyStringArray(body.requirements),
        responsibilitiesJson: stringifyStringArray(body.responsibilities ?? []),
        ...(body.expiresAt ? { expiresAt: new Date(body.expiresAt) } : {}),
        skills: {
          create: body.skillNames.map((name) => ({
            skill: {
              connectOrCreate: {
                where: { name },
                create: { name, category: 'General' },
              },
            },
          })),
        },
      },
      include: { company: true, skills: { include: { skill: true } } },
    });
    await writeAuditLog({
      req,
      action: AUDIT_ACTION.JOB_CREATED,
      entityType: 'Job',
      entityId: job.id,
      metadata: { companyId: req.auth!.companyId, title: job.title },
    });
    res.status(201).json({ job: toJobDto(job) });
  }),
);

router.put(
  '/:id',
  requireAuth(),
  requireRoles(ROLE.COMPANY, ROLE.ADMIN),
  requireVerifiedCompany(),
  asyncHandler(async (req, res) => {
    const id = z.string().min(1).parse(req.params.id);
    const body = jobPayloadSchema.parse(req.body);
    const existing = await prisma.job.findUnique({ where: { id } });
    if (!existing) {
      throw new HttpError(404, 'Job not found');
    }
    if (
      req.auth!.role === ROLE.COMPANY &&
      (!req.auth!.companyId || existing.companyId !== req.auth!.companyId)
    ) {
      throw new HttpError(403, 'Forbidden');
    }
    await prisma.jobSkill.deleteMany({ where: { jobId: id } });
    const job = await prisma.job.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        location: body.location,
        type: body.type,
        ...(body.salaryMin != null ? { salaryMin: body.salaryMin } : { salaryMin: null }),
        ...(body.salaryMax != null ? { salaryMax: body.salaryMax } : { salaryMax: null }),
        requirementsJson: stringifyStringArray(body.requirements),
        responsibilitiesJson: stringifyStringArray(body.responsibilities ?? []),
        ...(body.expiresAt ? { expiresAt: new Date(body.expiresAt) } : { expiresAt: null }),
        skills: {
          create: body.skillNames.map((name) => ({
            skill: {
              connectOrCreate: {
                where: { name },
                create: { name, category: 'General' },
              },
            },
          })),
        },
      },
      include: { company: true, skills: { include: { skill: true } } },
    });
    await writeAuditLog({
      req,
      action: AUDIT_ACTION.JOB_UPDATED,
      entityType: 'Job',
      entityId: job.id,
      metadata: { companyId: job.companyId, title: job.title },
    });
    res.json({ job: toJobDto(job) });
  }),
);

router.get(
  '/:id',
  optionalAuth(),
  asyncHandler(async (req, res) => {
    const id = z.string().min(1).parse(req.params.id);
    const job = await prisma.job.findUnique({
      where: { id },
      include: { company: true, skills: { include: { skill: true } } },
    });
    if (!job) {
      throw new HttpError(404, 'Job not found');
    }
    const skillNames = job.skills.map((js) => js.skill.name);
    const matchScore =
      req.auth && (req.auth.role === ROLE.CANDIDATE || req.auth.role === ROLE.ADMIN)
        ? computeMatchScore(req.auth.skills, skillNames)
        : undefined;
    res.json({ job: toJobDto(job, matchScore) });
  }),
);

export default router;
