# Cloudflare R2 Storage Setup

Last updated: 2026-05-16

## Decision

Use Cloudflare R2 for SkillGap AI verification documents and resume uploads.

Reason:

- R2 has a free tier suitable for a student/demo SaaS project.
- R2 is S3-compatible, so the current API storage adapter works without a provider-specific rewrite.
- R2 has no egress fees, which is useful when admins review verification documents.

## What This Enables

After R2 is configured:

- Company users can upload verification documents.
- Admin users can open verification documents through short-lived signed URLs.
- Verification documents remain private instead of public.
- Document access is audit logged.

Relevant backend APIs:

```txt
POST /api/companies/me/verification/documents
GET  /api/admin/verification-documents/:id/read-url
```

## Cloudflare R2 Setup Steps

1. Open Cloudflare dashboard.

2. Go to:

```txt
R2 Object Storage
```

3. Create a bucket:

```txt
skillgap-ai
```

4. Create an R2 API token:

```txt
Manage R2 API Tokens -> Create API Token
```

Recommended permissions:

```txt
Object Read & Write
```

Recommended bucket scope:

```txt
Apply to specific bucket: skillgap-ai
```

5. Copy these values:

```txt
Account ID
Access Key ID
Secret Access Key
Bucket name
```

## Render Environment Variables

Add these to the Render API Web Service environment:

```env
S3_BUCKET=skillgap-ai
S3_ACCESS_KEY=<Cloudflare R2 Access Key ID>
S3_SECRET_KEY=<Cloudflare R2 Secret Access Key>
S3_REGION=auto
S3_ENDPOINT=https://<cloudflare_account_id>.r2.cloudflarestorage.com
```

Optional:

```env
S3_PUBLIC_URL=
```

Leave `S3_PUBLIC_URL` empty unless you configure a public/custom domain for public resume links.

Verification documents do not need `S3_PUBLIC_URL` because they use signed private read URLs.

## Redeploy

After adding env vars in Render:

```txt
Manual Deploy -> Clear build cache & deploy
```

Or trigger a normal deploy from the latest GitHub commit.

## Verify Uploads

1. Login as a company user.
2. Open:

```txt
/company/verification
```

3. Start verification.
4. Upload required documents.
5. Submit verification.
6. Login as admin.
7. Open:

```txt
/admin
```

8. Open the verification submission.
9. Click:

```txt
Open securely
```

Expected result:

- Browser opens a short-lived signed Cloudflare R2 URL.
- API writes an audit log entry:

```txt
VERIFICATION_DOCUMENT_VIEWED
```

## Common Errors

### 501: S3-compatible storage is not configured yet

Cause:

One or more required env vars are missing:

```txt
S3_BUCKET
S3_ACCESS_KEY
S3_SECRET_KEY
```

Fix:

Add the Render env vars and redeploy.

### SignatureDoesNotMatch

Cause:

Incorrect endpoint, access key, secret key, or bucket.

Fix:

Confirm:

```txt
S3_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com
S3_REGION=auto
S3_BUCKET=skillgap-ai
```

### AccessDenied

Cause:

R2 token does not have read/write access to the bucket.

Fix:

Create a new R2 token scoped to the correct bucket with Object Read & Write permissions.

## Production Security Notes

- Do not make verification document buckets public.
- Do not expose R2 secret keys in web/mobile apps.
- Only the API should access R2 credentials.
- Signed URLs should stay short-lived. Current API expiry is 5 minutes.
- Every admin document view should remain audit logged.
