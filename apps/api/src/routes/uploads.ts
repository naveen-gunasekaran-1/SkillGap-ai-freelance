import { Router } from 'express';
import multer from 'multer';
import type { EducationEntry, ExperienceEntry, SkillAssessment } from '@skillgap/types';
import { asyncHandler } from '../lib/asyncHandler';
import { HttpError } from '../lib/httpError';
import { uploadResume } from '../lib/storage';
import { requireAuth } from '../middleware/auth';
import { parseResume, type ParsedResumeProfile } from '../lib/resumeParser';
import { prisma } from '../lib/prisma';
import {
  parseJsonArray,
  parseStringArray,
  stringifyJson,
  stringifyStringArray,
} from '../lib/jsonFields';
import { toUserDto } from '../lib/serializers';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 6 * 1024 * 1024 },
});

const allowedTypes = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]);

router.post(
  '/resume',
  upload.single('file'),
  asyncHandler(async (req, res) => {
    const file = req.file;
    if (!file) {
      throw new HttpError(400, 'Resume file is required');
    }
    if (!allowedTypes.has(file.mimetype)) {
      throw new HttpError(400, 'Resume must be a PDF, DOCX, or TXT file');
    }
    const shouldParse = req.query.parse === 'true';
    if (shouldParse && file.mimetype === 'application/msword') {
      throw new HttpError(400, 'Legacy DOC parsing is not supported. Please upload PDF or DOCX.');
    }

    const [url, parsed] = await Promise.all([
      uploadResume({
        buffer: file.buffer,
        originalName: file.originalname,
        contentType: file.mimetype,
      }),
      shouldParse
        ? parseResume({
            buffer: file.buffer,
            originalName: file.originalname,
            contentType: file.mimetype,
          })
        : Promise.resolve(undefined),
    ]);

    res.status(201).json({ url, ...(parsed ? { parsed } : {}) });
  }),
);

router.post(
  '/resume/profile',
  requireAuth(),
  upload.single('file'),
  asyncHandler(async (req, res) => {
    const file = req.file;
    if (!file) {
      throw new HttpError(400, 'Resume file is required');
    }
    if (!allowedTypes.has(file.mimetype)) {
      throw new HttpError(400, 'Resume must be a PDF, DOCX, or TXT file');
    }
    if (file.mimetype === 'application/msword') {
      throw new HttpError(400, 'Legacy DOC parsing is not supported. Please upload PDF or DOCX.');
    }

    const [url, parsed, currentUser] = await Promise.all([
      uploadResume({
        buffer: file.buffer,
        originalName: file.originalname,
        contentType: file.mimetype,
      }),
      parseResume({
        buffer: file.buffer,
        originalName: file.originalname,
        contentType: file.mimetype,
      }),
      prisma.user.findUniqueOrThrow({ where: { id: req.auth!.id } }),
    ]);

    const merged = mergeParsedProfile(currentUser, parsed);
    const user = await prisma.user.update({
      where: { id: req.auth!.id },
      data: {
        resumeUrl: url,
        resumeStatus: 'PENDING',
        ...(merged.title ? { title: merged.title } : {}),
        ...(merged.summary ? { summary: merged.summary } : {}),
        skillsJson: stringifyStringArray(merged.skills),
        skillLevelsJson: stringifyJson(merged.skillLevels),
        educationJson: stringifyJson(merged.education),
        experienceJson: stringifyJson(merged.experience),
      },
    });

    res.status(201).json({
      url,
      parsed,
      user: toUserDto(user),
    });
  }),
);

function mergeParsedProfile(
  user: {
    title: string;
    summary: string;
    skillsJson: string;
    skillLevelsJson: string;
    educationJson: string;
    experienceJson: string;
  },
  parsed: ParsedResumeProfile,
): ParsedResumeProfile {
  const skills = mergeStrings(parseStringArray(user.skillsJson), parsed.skills).slice(0, 40);
  const existingLevels = parseJsonArray<SkillAssessment>(user.skillLevelsJson);
  const skillLevels = mergeSkillLevels(existingLevels, parsed.skillLevels, skills);

  return {
    ...(user.title?.trim() ? { title: user.title } : parsed.title ? { title: parsed.title } : {}),
    ...(user.summary?.trim()
      ? { summary: user.summary }
      : parsed.summary
        ? { summary: parsed.summary }
        : {}),
    skills,
    skillLevels,
    education: mergeEducation(parseJsonArray<EducationEntry>(user.educationJson), parsed.education),
    experience: mergeExperience(
      parseJsonArray<ExperienceEntry>(user.experienceJson),
      parsed.experience,
    ),
  };
}

function mergeStrings(existing: string[], incoming: string[]): string[] {
  const seen = new Set<string>();
  return [...existing, ...incoming].filter((value) => {
    const key = value.trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function mergeSkillLevels(
  existing: SkillAssessment[],
  incoming: SkillAssessment[],
  skills: string[],
): SkillAssessment[] {
  const byName = new Map<string, SkillAssessment>();
  [...incoming, ...existing].forEach((entry) => {
    byName.set(entry.name.toLowerCase(), entry);
  });
  return skills.map((name) => byName.get(name.toLowerCase()) ?? { name, level: 'INTERMEDIATE' });
}

function mergeEducation(existing: EducationEntry[], incoming: EducationEntry[]): EducationEntry[] {
  const seen = new Set<string>();
  return [...existing, ...incoming]
    .filter((entry) => {
      const key = `${entry.school}:${entry.degree}:${entry.startYear}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 10);
}

function mergeExperience(
  existing: ExperienceEntry[],
  incoming: ExperienceEntry[],
): ExperienceEntry[] {
  const seen = new Set<string>();
  return [...existing, ...incoming]
    .filter((entry) => {
      const key = `${entry.company}:${entry.role}:${entry.startDate}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 20);
}

export default router;
