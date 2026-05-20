import type { Prisma } from '@prisma/client';
import type { Request } from 'express';
import { prisma } from './prisma';

export async function writeAuditLog(params: {
  req?: Request;
  actorId?: string | null;
  actorRole?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Prisma.InputJsonValue;
}): Promise<void> {
  const actorId = params.actorId ?? params.req?.auth?.id ?? null;
  const actorRole = params.actorRole ?? params.req?.auth?.role ?? null;
  const ipAddress = params.req?.ip;
  const userAgent = params.req?.get('user-agent');
  const data: Prisma.AuditLogUncheckedCreateInput = {
    ...(actorId ? { actorId } : {}),
    ...(actorRole ? { actorRole } : {}),
    action: params.action,
    entityType: params.entityType,
    ...(params.entityId ? { entityId: params.entityId } : {}),
    ...(ipAddress ? { ipAddress } : {}),
    ...(userAgent ? { userAgent } : {}),
    ...(params.metadata ? { metadataJson: params.metadata } : {}),
  };
  try {
    await prisma.auditLog.create({
      data,
    });
  } catch (error) {
    console.error({
      requestId: params.req?.requestId,
      err: error,
      message: 'Audit log write failed',
    });
  }
}
