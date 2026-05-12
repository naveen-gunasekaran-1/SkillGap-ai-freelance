import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../lib/asyncHandler';
import { HttpError } from '../lib/httpError';
import { toApplicationDto } from '../lib/serializers';
import { computeMatchScore, buildGapReport } from '../lib/matching';
import { enrichGapReportWithOpenAI } from '../lib/aiGapEnrichment';
import { requireAuth, requireRoles } from '../middleware/auth';
import { APPLICATION_STATUS, ROLE } from '../lib/constants';
import { parseStringArray } from '../lib/jsonFields';

const createSchema = z.object({
  jobId: z.string().min(1),
  coverNote: z.string().max(4000).optional(),
});

const statusEnum = z.enum([
  APPLICATION_STATUS.APPLIED,
  APPLICATION_STATUS.UNDER_REVIEW,
  APPLICATION_STATUS.SHORTLISTED,
  APPLICATION_STATUS.INTERVIEW_SCHEDULED,
  APPLICATION_STATUS.INTERVIEW_DONE,
  APPLICATION_STATUS.OFFER_EXTENDED,
  APPLICATION_STATUS.HIRED,
  APPLICATION_STATUS.REJECTED,
]);

const updateStatusSchema = z
  .object({
    status: statusEnum,
    rejectionReason: z.string().max(4000).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.status === APPLICATION_STATUS.REJECTED) {
      const reason = data.rejectionReason?.trim() ?? '';
      if (reason.length < 10) {
        ctx.addIssue({
          code: 'custom',
          message: 'Rejection reason is required (minimum 10 characters) when status is REJECTED',
          path: ['rejectionReason'],
        });
      }
    }
  });

const router = Router();

router.post(
  '/',
  requireAuth(),
  requireRoles(ROLE.CANDIDATE),
  asyncHandler(async (req, res) => {
    const body = createSchema.parse(req.body);
    const job = await prisma.job.findUnique({
      where: { id: body.jobId },
      include: { skills: { include: { skill: true } } },
    });
    if (!job) {
      throw new HttpError(404, 'Job not found');
    }

    const candidate = await prisma.user.findUnique({ where: { id: req.auth!.id } });
    if (!candidate) {
      throw new HttpError(401, 'User not found');
    }

    const skillNames = job.skills.map((js) => js.skill.name);
    const candidateSkills = parseStringArray(candidate.skillsJson);
    const matchScore = computeMatchScore(candidateSkills, skillNames);

    const existing = await prisma.application.findUnique({
      where: { candidateId_jobId: { candidateId: candidate.id, jobId: job.id } },
    });
    if (existing) {
      throw new HttpError(409, 'You already applied to this job');
    }

    const application = await prisma.application.create({
      data: {
        candidateId: candidate.id,
        jobId: job.id,
        status: APPLICATION_STATUS.APPLIED,
        matchScore,
        ...(body.coverNote ? { coverNote: body.coverNote } : {}),
      },
      include: { job: { include: { company: true, skills: { include: { skill: true } } } } },
    });

    let gapReport = buildGapReport({
      applicationId: application.id,
      candidateSkills,
      jobTitle: job.title,
      jobSkillNames: skillNames,
      requirements: parseStringArray(job.requirementsJson),
    });
    gapReport = await enrichGapReportWithOpenAI(gapReport, { jobTitle: job.title });

    const updated = await prisma.application.update({
      where: { id: application.id },
      data: { gapReportJson: JSON.stringify(gapReport) },
      include: { job: { include: { company: true, skills: { include: { skill: true } } } } },
    });

    res.status(201).json({ application: toApplicationDto(updated) });
  }),
);

router.get(
  '/',
  requireAuth(),
  asyncHandler(async (req, res) => {
    if (req.auth!.role === ROLE.ADMIN) {
      const apps = await prisma.application.findMany({
        orderBy: { appliedAt: 'desc' },
        take: 200,
        include: { job: { include: { company: true, skills: { include: { skill: true } } } } },
      });
      res.json({ applications: apps.map((a) => toApplicationDto(a)) });
      return;
    }

    if (req.auth!.role === ROLE.CANDIDATE) {
      const apps = await prisma.application.findMany({
        where: { candidateId: req.auth!.id },
        orderBy: { appliedAt: 'desc' },
        include: { job: { include: { company: true, skills: { include: { skill: true } } } } },
      });
      res.json({ applications: apps.map((a) => toApplicationDto(a)) });
      return;
    }

    if (req.auth!.role === ROLE.COMPANY) {
      if (!req.auth!.companyId) {
        throw new HttpError(400, 'Company profile is not linked');
      }
      const apps = await prisma.application.findMany({
        where: { job: { companyId: req.auth!.companyId } },
        orderBy: { appliedAt: 'desc' },
        include: { job: { include: { company: true, skills: { include: { skill: true } } } } },
      });
      res.json({ applications: apps.map((a) => toApplicationDto(a)) });
      return;
    }

    throw new HttpError(403, 'Forbidden');
  }),
);

router.get(
  '/:id',
  requireAuth(),
  asyncHandler(async (req, res) => {
    const id = z.string().min(1).parse(req.params.id);
    const app = await prisma.application.findUnique({
      where: { id },
      include: { job: { include: { company: true, skills: { include: { skill: true } } } } },
    });
    if (!app) {
      throw new HttpError(404, 'Application not found');
    }

    if (req.auth!.role === ROLE.ADMIN) {
      res.json({ application: toApplicationDto(app) });
      return;
    }
    if (req.auth!.role === ROLE.CANDIDATE && app.candidateId === req.auth!.id) {
      res.json({ application: toApplicationDto(app) });
      return;
    }
    if (req.auth!.role === ROLE.COMPANY && req.auth!.companyId && app.job.companyId === req.auth!.companyId) {
      res.json({ application: toApplicationDto(app) });
      return;
    }

    throw new HttpError(403, 'Forbidden');
  }),
);

router.patch(
  '/:id/status',
  requireAuth(),
  requireRoles(ROLE.COMPANY, ROLE.ADMIN),
  asyncHandler(async (req, res) => {
    const id = z.string().min(1).parse(req.params.id);
    const body = updateStatusSchema.parse(req.body);

    const app = await prisma.application.findUnique({
      where: { id },
      include: { job: true },
    });
    if (!app) {
      throw new HttpError(404, 'Application not found');
    }

    if (req.auth!.role === ROLE.COMPANY) {
      if (!req.auth!.companyId || app.job.companyId !== req.auth!.companyId) {
        throw new HttpError(403, 'Forbidden');
      }
    }

    const updated = await prisma.application.update({
      where: { id },
      data: {
        status: body.status,
        rejectionReason:
          body.status === APPLICATION_STATUS.REJECTED ? body.rejectionReason!.trim() : null,
      },
      include: { job: { include: { company: true, skills: { include: { skill: true } } } } },
    });

    res.json({ application: toApplicationDto(updated) });
  }),
);

export default router;
