import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { GetObjectCommand, PutObjectCommand, S3Client, type S3ClientConfig } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from './env';
import { HttpError } from './httpError';

const MAX_RESUME_BYTES = 6 * 1024 * 1024;

function assertS3Configured(): void {
  if (!env.S3_BUCKET || !env.S3_ACCESS_KEY || !env.S3_SECRET_KEY) {
    throw new HttpError(501, 'S3-compatible storage is not configured yet');
  }
}

export function getStorageConfigurationStatus(): {
  configured: boolean;
  bucketConfigured: boolean;
  accessKeyConfigured: boolean;
  secretKeyConfigured: boolean;
  endpointConfigured: boolean;
  publicUrlConfigured: boolean;
  provider: 'cloudflare-r2-or-s3-compatible';
} {
  return {
    configured: Boolean(env.S3_BUCKET && env.S3_ACCESS_KEY && env.S3_SECRET_KEY),
    bucketConfigured: Boolean(env.S3_BUCKET),
    accessKeyConfigured: Boolean(env.S3_ACCESS_KEY),
    secretKeyConfigured: Boolean(env.S3_SECRET_KEY),
    endpointConfigured: Boolean(env.S3_ENDPOINT),
    publicUrlConfigured: Boolean(env.S3_PUBLIC_URL),
    provider: 'cloudflare-r2-or-s3-compatible',
  };
}

function getS3Client(): S3Client {
  assertS3Configured();
  const config: S3ClientConfig = {
    region: env.S3_REGION ?? 'auto',
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY!,
      secretAccessKey: env.S3_SECRET_KEY!,
    },
    forcePathStyle: Boolean(env.S3_ENDPOINT),
  };
  if (env.S3_ENDPOINT) {
    config.endpoint = env.S3_ENDPOINT;
  }
  return new S3Client(config);
}

function buildPublicUrl(key: string): string {
  if (env.S3_PUBLIC_URL) {
    return `${env.S3_PUBLIC_URL.replace(/\/$/, '')}/${key}`;
  }
  if (!env.S3_ENDPOINT || !env.S3_BUCKET) {
    throw new HttpError(500, 'S3 public URL is not configured');
  }
  const base = env.S3_ENDPOINT.replace(/\/$/, '');
  return `${base}/${env.S3_BUCKET}/${key}`;
}

export async function uploadResume(params: {
  buffer: Buffer;
  originalName: string;
  contentType: string;
}): Promise<string> {
  assertS3Configured();

  if (params.buffer.length > MAX_RESUME_BYTES) {
    throw new HttpError(413, 'Resume file is too large (max 6MB)');
  }

  const ext = path.extname(params.originalName).toLowerCase();
  const key = `resumes/${randomUUID()}${ext || '.pdf'}`;

  const client = getS3Client();
  await client.send(
    new PutObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
      Body: params.buffer,
      ContentType: params.contentType,
      ACL: 'public-read',
    }),
  );

  return buildPublicUrl(key);
}

export async function uploadPrivateVerificationDocument(params: {
  buffer: Buffer;
  originalName: string;
  contentType: string;
  companyId: string;
}): Promise<{ storageKey: string; checksumSha256: string }> {
  assertS3Configured();

  if (params.buffer.length > MAX_RESUME_BYTES) {
    throw new HttpError(413, 'Verification document is too large (max 6MB)');
  }

  const { createHash } = await import('node:crypto');
  const ext = path.extname(params.originalName).toLowerCase();
  const storageKey = `verification-documents/${params.companyId}/${randomUUID()}${ext || '.pdf'}`;
  const checksumSha256 = createHash('sha256').update(params.buffer).digest('hex');

  const client = getS3Client();
  await client.send(
    new PutObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: storageKey,
      Body: params.buffer,
      ContentType: params.contentType,
      Metadata: {
        checksumSha256,
        companyId: params.companyId,
      },
    }),
  );

  return { storageKey, checksumSha256 };
}

export async function createPrivateObjectReadUrl(params: {
  storageKey: string;
  downloadName?: string;
  expiresInSeconds?: number;
}): Promise<string> {
  assertS3Configured();
  const command = new GetObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: params.storageKey,
    ...(params.downloadName
      ? { ResponseContentDisposition: `inline; filename="${params.downloadName.replace(/"/g, '')}"` }
      : {}),
  });
  return getSignedUrl(getS3Client(), command, {
    expiresIn: params.expiresInSeconds ?? 60 * 5,
  });
}
