import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../lib/asyncHandler';
import { toCompanyDto } from '../lib/serializers';
import { HttpError } from '../lib/httpError';
import { requireAuth, requireRoles } from '../middleware/auth';
import {
  AUDIT_ACTION,
  COMPANY_VERIFICATION_STATUS,
  ROLE,
  VERIFICATION_DOCUMENT_TYPE,
} from '../lib/constants';
import { uploadPrivateVerificationDocument } from '../lib/storage';
import { writeAuditLog } from '../lib/audit';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 6 * 1024 * 1024 },
});

const allowedVerificationTypes = new Set(['application/pdf', 'image/jpeg', 'image/png']);

const updateCompanySchema = z.object({
  name: z.string().min(1).max(160).optional(),
  industry: z.string().min(1).max(120).optional(),
  size: z.string().min(1).max(60).optional(),
  website: z.string().url().max(200).optional(),
  description: z.string().max(1200).optional(),
  logo: z.string().url().max(500).optional(),
});

const verificationSchema = z.object({
  region: z.enum(['INDIA', 'GLOBAL']),
  countryCode: z
    .string()
    .min(2)
    .max(2)
    .transform((v) => v.toUpperCase()),
  metadata: z.record(z.unknown()).optional(),
});

const documentTypeSchema = z.enum([
  VERIFICATION_DOCUMENT_TYPE.GST_CERTIFICATE,
  VERIFICATION_DOCUMENT_TYPE.PAN,
  VERIFICATION_DOCUMENT_TYPE.CIN,
  VERIFICATION_DOCUMENT_TYPE.CERTIFICATE_OF_INCORPORATION,
  VERIFICATION_DOCUMENT_TYPE.ADDRESS_PROOF,
  VERIFICATION_DOCUMENT_TYPE.BUSINESS_REGISTRATION,
  VERIFICATION_DOCUMENT_TYPE.TAX_DOCUMENT,
  VERIFICATION_DOCUMENT_TYPE.BUSINESS_LICENSE,
]);

function requiredDocumentTypes(region: 'INDIA' | 'GLOBAL'): string[] {
  if (region === 'INDIA') {
    return [
      VERIFICATION_DOCUMENT_TYPE.GST_CERTIFICATE,
      VERIFICATION_DOCUMENT_TYPE.PAN,
      VERIFICATION_DOCUMENT_TYPE.CIN,
      VERIFICATION_DOCUMENT_TYPE.CERTIFICATE_OF_INCORPORATION,
      VERIFICATION_DOCUMENT_TYPE.ADDRESS_PROOF,
    ];
  }
  return [
    VERIFICATION_DOCUMENT_TYPE.BUSINESS_REGISTRATION,
    VERIFICATION_DOCUMENT_TYPE.TAX_DOCUMENT,
    VERIFICATION_DOCUMENT_TYPE.BUSINESS_LICENSE,
  ];
}

async function getCompanyIdOrThrow(req: { auth?: { companyId: string | null } }): Promise<string> {
  const companyId = req.auth?.companyId;
  if (!companyId) {
    throw new HttpError(400, 'Company profile is not linked');
  }
  return companyId;
}

router.get(
  '/me',
  requireAuth(),
  requireRoles(ROLE.COMPANY, ROLE.ADMIN),
  asyncHandler(async (req, res) => {
    if (!req.auth!.companyId) {
      throw new HttpError(400, 'Company profile is not linked');
    }
    const company = await prisma.company.findUnique({ where: { id: req.auth!.companyId } });
    if (!company) {
      throw new HttpError(404, 'Company not found');
    }
    res.json({ company: toCompanyDto(company) });
  }),
);

router.patch(
  '/me',
  requireAuth(),
  requireRoles(ROLE.COMPANY, ROLE.ADMIN),
  asyncHandler(async (req, res) => {
    if (!req.auth!.companyId) {
      throw new HttpError(400, 'Company profile is not linked');
    }
    const body = updateCompanySchema.parse(req.body);
    if (Object.keys(body).length === 0) {
      throw new HttpError(400, 'No fields to update');
    }
    const company = await prisma.company.update({
      where: { id: req.auth!.companyId },
      data: {
        ...(body.name ? { name: body.name } : {}),
        ...(body.industry ? { industry: body.industry } : {}),
        ...(body.size ? { size: body.size } : {}),
        ...(body.website ? { website: body.website } : {}),
        ...(body.description != null ? { description: body.description } : {}),
        ...(body.logo ? { logo: body.logo } : {}),
      },
    });
    res.json({ company: toCompanyDto(company) });
  }),
);

router.get(
  '/me/verification',
  requireAuth(),
  requireRoles(ROLE.COMPANY, ROLE.ADMIN),
  asyncHandler(async (req, res) => {
    const companyId = await getCompanyIdOrThrow(req);
    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) {
      throw new HttpError(404, 'Company not found');
    }
    const verification = await prisma.companyVerification.findFirst({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      include: { documents: { orderBy: { createdAt: 'desc' } }, fraudFlags: true },
    });
    res.json({
      company: toCompanyDto(company),
      verification,
      requiredDocuments: requiredDocumentTypes(
        verification?.region === 'INDIA' ? 'INDIA' : 'GLOBAL',
      ),
    });
  }),
);

router.post(
  '/me/verification',
  requireAuth(),
  requireRoles(ROLE.COMPANY, ROLE.ADMIN),
  asyncHandler(async (req, res) => {
    const companyId = await getCompanyIdOrThrow(req);
    const body = verificationSchema.parse(req.body);
    const verification = await prisma.companyVerification.create({
      data: {
        companyId,
        status: COMPANY_VERIFICATION_STATUS.IN_PROGRESS,
        region: body.region,
        countryCode: body.countryCode,
        submittedById: req.auth!.id,
        ...(body.metadata ? { metadataJson: body.metadata as Prisma.InputJsonValue } : {}),
      } satisfies Prisma.CompanyVerificationUncheckedCreateInput,
      include: { documents: true, fraudFlags: true },
    });
    await prisma.company.update({
      where: { id: companyId },
      data: {
        verificationStatus: COMPANY_VERIFICATION_STATUS.IN_PROGRESS,
        isVerified: false,
        verificationBadge: null,
      },
    });
    await writeAuditLog({
      req,
      action: AUDIT_ACTION.COMPANY_VERIFICATION_CREATED,
      entityType: 'CompanyVerification',
      entityId: verification.id,
      metadata: { companyId, region: body.region, countryCode: body.countryCode },
    });
    res.status(201).json({ verification, requiredDocuments: requiredDocumentTypes(body.region) });
  }),
);

router.post(
  '/me/verification/documents',
  requireAuth(),
  requireRoles(ROLE.COMPANY, ROLE.ADMIN),
  upload.single('file'),
  asyncHandler(async (req, res) => {
    const companyId = await getCompanyIdOrThrow(req);
    const type = documentTypeSchema.parse(req.body.type);
    const verificationId = z.string().min(1).optional().parse(req.body.verificationId);
    const file = req.file;
    if (!file) {
      throw new HttpError(400, 'Verification document file is required');
    }
    if (!allowedVerificationTypes.has(file.mimetype)) {
      throw new HttpError(400, 'Verification document must be PDF, JPG, or PNG');
    }

    const verification = verificationId
      ? await prisma.companyVerification.findFirst({ where: { id: verificationId, companyId } })
      : await prisma.companyVerification.findFirst({
          where: { companyId },
          orderBy: { createdAt: 'desc' },
        });
    if (!verification) {
      throw new HttpError(400, 'Create a company verification before uploading documents');
    }

    const stored = await uploadPrivateVerificationDocument({
      buffer: file.buffer,
      originalName: file.originalname,
      contentType: file.mimetype,
      companyId,
    });
    const document = await prisma.verificationDocument.create({
      data: {
        companyId,
        verificationId: verification.id,
        type,
        originalName: file.originalname,
        storageKey: stored.storageKey,
        contentType: file.mimetype,
        sizeBytes: file.size,
        checksumSha256: stored.checksumSha256,
        uploadedById: req.auth!.id,
      },
    });
    await writeAuditLog({
      req,
      action: AUDIT_ACTION.VERIFICATION_DOCUMENT_UPLOADED,
      entityType: 'VerificationDocument',
      entityId: document.id,
      metadata: { companyId, verificationId: verification.id, type },
    });
    res.status(201).json({ document });
  }),
);

router.post(
  '/me/verification/submit',
  requireAuth(),
  requireRoles(ROLE.COMPANY, ROLE.ADMIN),
  asyncHandler(async (req, res) => {
    const companyId = await getCompanyIdOrThrow(req);
    const verificationId = z.string().min(1).optional().parse(req.body.verificationId);
    const verification = verificationId
      ? await prisma.companyVerification.findFirst({
          where: { id: verificationId, companyId },
          include: { documents: true },
        })
      : await prisma.companyVerification.findFirst({
          where: { companyId },
          orderBy: { createdAt: 'desc' },
          include: { documents: true },
        });
    if (!verification) {
      throw new HttpError(400, 'Create a company verification before submitting');
    }
    const required = requiredDocumentTypes(verification.region === 'INDIA' ? 'INDIA' : 'GLOBAL');
    const uploaded = new Set(verification.documents.map((doc) => doc.type));
    const missing = required.filter((type) => !uploaded.has(type));
    if (missing.length > 0) {
      throw new HttpError(400, `Missing required verification documents: ${missing.join(', ')}`);
    }
    const updated = await prisma.companyVerification.update({
      where: { id: verification.id },
      data: {
        status: COMPANY_VERIFICATION_STATUS.SUBMITTED,
        submittedAt: new Date(),
      },
      include: { documents: true, fraudFlags: true },
    });
    await prisma.company.update({
      where: { id: companyId },
      data: {
        verificationStatus: COMPANY_VERIFICATION_STATUS.SUBMITTED,
        verificationSubmittedAt: new Date(),
        isVerified: false,
      },
    });
    await writeAuditLog({
      req,
      action: AUDIT_ACTION.COMPANY_VERIFICATION_SUBMITTED,
      entityType: 'CompanyVerification',
      entityId: updated.id,
      metadata: { companyId, documentCount: updated.documents.length },
    });
    res.json({ verification: updated });
  }),
);

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
