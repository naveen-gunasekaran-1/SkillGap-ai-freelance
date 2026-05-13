import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../lib/asyncHandler';
import { HttpError } from '../lib/httpError';
import { toUserDto } from '../lib/serializers';
import { requireAuth } from '../middleware/auth';
import { stringifyJson, stringifyStringArray } from '../lib/jsonFields';

const patchSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  title: z.string().min(2).max(120).optional(),
  location: z.string().min(2).max(120).optional(),
  summary: z.string().min(10).max(600).optional(),
  phone: z.string().min(7).max(40).optional(),
  skills: z.array(z.string().min(1).max(64)).max(40).optional(),
  skillLevels: z
    .array(
      z.object({
        name: z.string().min(1).max(64),
        level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']),
      }),
    )
    .max(40)
    .optional(),
  education: z
    .array(
      z.object({
        school: z.string().min(1).max(160),
        degree: z.string().min(1).max(120),
        field: z.string().max(120).optional(),
        startYear: z.number().int().min(1980).max(2100),
        endYear: z.number().int().min(1980).max(2100).optional(),
        gpa: z.string().max(12).optional(),
      }),
    )
    .max(10)
    .optional(),
  experience: z
    .array(
      z.object({
        company: z.string().min(1).max(160),
        role: z.string().min(1).max(120),
        startDate: z.string().min(4).max(24),
        endDate: z.string().min(4).max(24).optional(),
        summary: z.string().max(800).optional(),
        bullets: z.array(z.string().min(1).max(220)).max(8).optional(),
      }),
    )
    .max(20)
    .optional(),
  internships: z
    .array(
      z.object({
        company: z.string().min(1).max(160),
        role: z.string().min(1).max(120),
        startDate: z.string().min(4).max(24),
        endDate: z.string().min(4).max(24).optional(),
        summary: z.string().max(600).optional(),
      }),
    )
    .max(10)
    .optional(),
  projects: z
    .array(
      z.object({
        name: z.string().min(1).max(160),
        stack: z.array(z.string().min(1).max(40)).min(1).max(20),
        link: z.string().url().max(300).optional(),
        summary: z.string().max(600).optional(),
      }),
    )
    .max(20)
    .optional(),
  links: z
    .array(
      z.object({
        label: z.string().min(2).max(40),
        url: z.string().url().max(300),
      }),
    )
    .max(8)
    .optional(),
  resumeUrl: z.string().url().max(500).optional(),
  avatar: z.string().url().max(500).optional(),
});

const router = Router();

router.patch(
  '/me',
  requireAuth(),
  asyncHandler(async (req, res) => {
    const body = patchSchema.parse(req.body);
    if (Object.keys(body).length === 0) {
      throw new HttpError(400, 'No fields to update');
    }

    const user = await prisma.user.update({
      where: { id: req.auth!.id },
      data: {
        ...(body.name ? { name: body.name } : {}),
        ...(body.title ? { title: body.title } : {}),
        ...(body.location ? { location: body.location } : {}),
        ...(body.summary ? { summary: body.summary } : {}),
        ...(body.phone ? { phone: body.phone } : {}),
        ...(body.skills ? { skillsJson: stringifyStringArray(body.skills) } : {}),
        ...(body.skillLevels ? { skillLevelsJson: stringifyJson(body.skillLevels) } : {}),
        ...(body.education ? { educationJson: stringifyJson(body.education) } : {}),
        ...(body.experience ? { experienceJson: stringifyJson(body.experience) } : {}),
        ...(body.internships ? { internshipsJson: stringifyJson(body.internships) } : {}),
        ...(body.projects ? { projectsJson: stringifyJson(body.projects) } : {}),
        ...(body.links ? { linksJson: stringifyJson(body.links) } : {}),
        ...(body.resumeUrl ? { resumeUrl: body.resumeUrl, resumeStatus: 'PENDING' } : {}),
        ...(body.avatar ? { avatar: body.avatar } : {}),
      },
    });

    res.json({ user: toUserDto(user) });
  }),
);

export default router;
