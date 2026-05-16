import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { PutObjectCommand, S3Client, type S3ClientConfig } from '@aws-sdk/client-s3';
import { env } from './env';
import { HttpError } from './httpError';

const MAX_RESUME_BYTES = 6 * 1024 * 1024;

function assertS3Configured(): void {
  if (!env.S3_BUCKET || !env.S3_ACCESS_KEY || !env.S3_SECRET_KEY) {
    throw new HttpError(501, 'Resume uploads are not configured yet');
  }
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
