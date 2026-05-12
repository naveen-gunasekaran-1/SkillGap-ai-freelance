import { Router } from 'express';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../lib/asyncHandler';
import { HttpError } from '../lib/httpError';
import { toJobDto } from '../lib/serializers';
import { computeMatchScore } from '../lib/matching';
import { optionalAuth } from '../middleware/auth';
import { JOB_TYPE, ROLE, type JobType } from '../lib/constants';

const listQuerySchema = z.object({
  search: z.string().optional(),
  type: z.string().optional(),
  verified: z.enum(['true', 'false']).optional(),
});

const router = Router();

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

    const jobs = await prisma.job.findMany({
      where,
      orderBy: { postedAt: 'desc' },
      include: {
        company: true,
        skills: { include: { skill: true } },
      },
    });

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

    res.json({ jobs: payload });
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
