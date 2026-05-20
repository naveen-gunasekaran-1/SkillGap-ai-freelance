import { Router } from 'express';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../lib/asyncHandler';
import { HttpError } from '../lib/httpError';
import { requireAuth, requireRoles } from '../middleware/auth';
import { AUDIT_ACTION, COMPANY_VERIFICATION_STATUS, ROLE } from '../lib/constants';
import { writeAuditLog } from '../lib/audit';
import { createPrivateObjectReadUrl, getStorageConfigurationStatus } from '../lib/storage';

const router = Router();

router.use(requireAuth(), requireRoles(ROLE.ADMIN));

const decisionSchema = z
  .object({
    decision: z.enum(['APPROVED', 'REJECTED']),
    notes: z.string().max(2000).optional(),
    rejectionReason: z.string().max(2000).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.decision === 'REJECTED' && !data.rejectionReason?.trim()) {
      ctx.addIssue({
        code: 'custom',
        message: 'Rejection reason is required when rejecting verification',
        path: ['rejectionReason'],
      });
    }
  });

router.get(
  '/verifications',
  asyncHandler(async (req, res) => {
    const status = z
      .enum([
        COMPANY_VERIFICATION_STATUS.IN_PROGRESS,
        COMPANY_VERIFICATION_STATUS.SUBMITTED,
        COMPANY_VERIFICATION_STATUS.UNDER_REVIEW,
        COMPANY_VERIFICATION_STATUS.VERIFIED,
        COMPANY_VERIFICATION_STATUS.REJECTED,
        COMPANY_VERIFICATION_STATUS.SUSPENDED,
      ])
      .optional()
      .parse(req.query.status);
    const verifications = await prisma.companyVerification.findMany({
      ...(status ? { where: { status } } : {}),
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        company: true,
        documents: { orderBy: { createdAt: 'desc' } },
        fraudFlags: true,
        adminReviews: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });
    res.json({ verifications });
  }),
);

router.get(
  '/storage/status',
  asyncHandler(async (_req, res) => {
    res.json({ storage: getStorageConfigurationStatus() });
  }),
);

router.get(
  '/verifications/:id',
  asyncHandler(async (req, res) => {
    const id = z.string().min(1).parse(req.params.id);
    const verification = await prisma.companyVerification.findUnique({
      where: { id },
      include: {
        company: true,
        documents: { orderBy: { createdAt: 'desc' } },
        fraudFlags: { orderBy: { createdAt: 'desc' } },
        adminReviews: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!verification) {
      throw new HttpError(404, 'Verification not found');
    }
    res.json({ verification });
  }),
);

router.patch(
  '/verifications/:id/decision',
  asyncHandler(async (req, res) => {
    const id = z.string().min(1).parse(req.params.id);
    const body = decisionSchema.parse(req.body);
    const existing = await prisma.companyVerification.findUnique({
      where: { id },
      include: { company: true },
    });
    if (!existing) {
      throw new HttpError(404, 'Verification not found');
    }

    const approved = body.decision === 'APPROVED';
    const status = approved
      ? COMPANY_VERIFICATION_STATUS.VERIFIED
      : COMPANY_VERIFICATION_STATUS.REJECTED;
    const now = new Date();

    const [verification] = await prisma.$transaction([
      prisma.companyVerification.update({
        where: { id },
        data: {
          status,
          reviewedById: req.auth!.id,
          reviewedAt: now,
          rejectionReason: approved ? null : body.rejectionReason!.trim(),
        },
        include: { company: true, documents: true, fraudFlags: true },
      }),
      prisma.company.update({
        where: { id: existing.companyId },
        data: {
          isVerified: approved,
          verificationStatus: status,
          verificationBadge: approved ? 'MANUAL' : null,
          verificationReviewedAt: now,
        },
      }),
      prisma.adminReview.create({
        data: {
          entityType: 'CompanyVerification',
          entityId: id,
          companyId: existing.companyId,
          verificationId: id,
          createdById: req.auth!.id,
          reviewedById: req.auth!.id,
          status: 'CLOSED',
          decision: body.decision,
          ...(body.notes ? { notes: body.notes } : {}),
          metadataJson: approved
            ? { approved: true }
            : { approved: false, rejectionReason: body.rejectionReason!.trim() },
          reviewedAt: now,
        } satisfies Prisma.AdminReviewUncheckedCreateInput,
      }),
    ]);

    await writeAuditLog({
      req,
      action: approved
        ? AUDIT_ACTION.COMPANY_VERIFICATION_APPROVED
        : AUDIT_ACTION.COMPANY_VERIFICATION_REJECTED,
      entityType: 'CompanyVerification',
      entityId: id,
      metadata: { companyId: existing.companyId, decision: body.decision },
    });

    res.json({ verification });
  }),
);

router.get(
  '/audit-logs',
  asyncHandler(async (_req, res) => {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: { actor: { select: { id: true, name: true, email: true, role: true } } },
    });
    res.json({ logs });
  }),
);

router.get(
  '/verification-documents/:id/read-url',
  asyncHandler(async (req, res) => {
    const id = z.string().min(1).parse(req.params.id);
    const document = await prisma.verificationDocument.findUnique({
      where: { id },
      include: { company: true, verification: true },
    });
    if (!document) {
      throw new HttpError(404, 'Verification document not found');
    }
    const url = await createPrivateObjectReadUrl({
      storageKey: document.storageKey,
      downloadName: document.originalName,
      expiresInSeconds: 60 * 5,
    });
    await writeAuditLog({
      req,
      action: AUDIT_ACTION.VERIFICATION_DOCUMENT_VIEWED,
      entityType: 'VerificationDocument',
      entityId: document.id,
      metadata: {
        companyId: document.companyId,
        verificationId: document.verificationId,
        type: document.type,
      },
    });
    res.json({ url, expiresInSeconds: 60 * 5 });
  }),
);

router.get(
  '/fraud-flags',
  asyncHandler(async (_req, res) => {
    const flags = await prisma.fraudFlag.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: { company: true, verification: true },
    });
    res.json({ flags });
  }),
);

export default router;
