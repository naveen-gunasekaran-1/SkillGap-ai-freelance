import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../lib/asyncHandler';
import { HttpError } from '../lib/httpError';
import { buildGapReport } from '../lib/matching';
import { enrichGapReportWithOpenAI } from '../lib/aiGapEnrichment';
import { optionalAuth } from '../middleware/auth';
import { ROLE } from '../lib/constants';
import { parseStringArray } from '../lib/jsonFields';

const previewSchema = z.object({
  jobId: z.string().min(1),
  candidateSkills: z.array(z.string().min(1).max(64)).max(40).optional(),
});

const router = Router();

router.post(
  '/gap-preview',
  optionalAuth(),
  asyncHandler(async (req, res) => {
    const body = previewSchema.parse(req.body);
    const job = await prisma.job.findUnique({
      where: { id: body.jobId },
      include: { skills: { include: { skill: true } } },
    });
    if (!job) {
      throw new HttpError(404, 'Job not found');
    }

    const skillNames = job.skills.map((js) => js.skill.name);

    let skills =
      body.candidateSkills ??
      (req.auth?.role === ROLE.CANDIDATE || req.auth?.role === ROLE.ADMIN
        ? req.auth.skills
        : undefined);

    if (!skills || skills.length === 0) {
      skills = ['React', 'TypeScript', 'JavaScript', 'Git'];
    }

    const fakeApplicationId = `preview-${job.id}`;
    let report = buildGapReport({
      applicationId: fakeApplicationId,
      candidateSkills: skills,
      jobTitle: job.title,
      jobSkillNames: skillNames,
      requirements: parseStringArray(job.requirementsJson),
    });
    report = await enrichGapReportWithOpenAI(report, { jobTitle: job.title });

    res.json({ gapReport: report });
  }),
);

export default router;
