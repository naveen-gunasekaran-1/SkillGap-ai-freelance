import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../lib/asyncHandler';
import { toCompanyDto } from '../lib/serializers';

const router = Router();

router.get(
  '/featured',
  asyncHandler(async (_req, res) => {
    const companies = await prisma.company.findMany({
      take: 12,
      orderBy: { name: 'asc' },
      include: { _count: { select: { jobs: true } } },
    });

    res.json({
      companies: companies.map((c) => ({
        ...toCompanyDto(c),
        openJobs: c._count.jobs,
      })),
    });
  }),
);

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const companies = await prisma.company.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { jobs: true } } },
    });
    res.json({
      companies: companies.map((c) => ({
        ...toCompanyDto(c),
        openJobs: c._count.jobs,
      })),
    });
  }),
);

export default router;
