# SkillGap AI Status Update: Enterprise Verification Layer

Last updated: 2026-05-16

This report documents the updates completed after the previous current status report.

## 1. Summary

The project has moved further into the enterprise verification phase. The backend already had the verification schema and APIs; the latest update added the admin review console and improved the company-side verification experience so that unverified companies are guided correctly instead of seeing repeated failed API calls.

The main product direction remains:

```txt
SkillGap AI = Explainable AI Hiring Infrastructure
```

The immediate enterprise focus is:

- verified recruiter ecosystem
- company trust controls
- admin approval workflow
- auditable verification decisions
- safer candidate-data access

## 2. New Admin Verification Console

A real admin verification dashboard now exists at:

```txt
/admin
```

The old static admin panel was replaced with a live operations console.

Implemented admin features:

- Verification queue
- Verification detail view
- Company submission metadata
- Uploaded document metadata view
- Fraud score display
- Admin notes field
- Rejection reason field
- Approve company action
- Reject company action
- Audit log tab
- Fraud flags tab

Relevant file:

```txt
apps/web/src/pages/AdminPanel.tsx
```

The admin panel calls these API endpoints:

```txt
GET    /api/admin/verifications
GET    /api/admin/verifications/:id
PATCH  /api/admin/verifications/:id/decision
GET    /api/admin/audit-logs
GET    /api/admin/fraud-flags
```

## 3. Company Verification UI Improvements

The company verification page exists at:

```txt
/company/verification
```

Implemented company-side features:

- Start verification
- Select India/global region
- Upload required documents
- Submit verification for admin review
- Display verification status
- Display rejection reason if rejected
- Improved upload error messages

Relevant file:

```txt
apps/web/src/pages/company/CompanyVerificationPage.tsx
```

## 4. Fixed Confusing 403 Errors

Observed browser errors:

```txt
GET /api/applications 403
```

Meaning:

The company account is not verified yet. The backend now intentionally blocks unverified company users from accessing applicant/candidate data.

This is expected enterprise security behavior.

Issue:

The UI was still calling `/api/applications` from company dashboard/candidate/pipeline pages before confirming company verification status. This caused repeated console errors.

Fix implemented:

- Added company trust query hook.
- Added reusable verification-required UI card.
- Stopped unverified company pages from calling `/api/applications`.
- Unverified companies now see a clear call to complete verification.

New files:

```txt
apps/web/src/hooks/useCompanyTrust.ts
apps/web/src/components/VerificationRequiredCard.tsx
```

Updated files:

```txt
apps/web/src/pages/company/CompanyDashboardPage.tsx
apps/web/src/pages/company/CandidateReviewPage.tsx
apps/web/src/pages/company/HiringPipelinePage.tsx
```

## 5. Explanation Of Current Browser Errors

### 403: `/api/applications`

Cause:

```txt
Company verification is required before accessing applicant data.
```

Status:

This is expected behavior. The UI has now been updated to avoid this request until the company is verified.

### 400: `/api/companies/me/verification/submit`

Cause:

Verification submission was attempted before all required documents were uploaded.

For India verification, required documents are:

- GST certificate
- PAN
- CIN
- Certificate of Incorporation
- Address proof

For global verification, required documents are:

- Business registration
- Tax document
- Business license

Status:

This is expected validation behavior.

### 501: `/api/companies/me/verification/documents`

Cause:

Document upload storage is not configured on Render.

The backend requires S3-compatible storage environment variables before verification document upload can work.

Required Render environment variables:

```env
S3_BUCKET=
S3_ACCESS_KEY=
S3_SECRET_KEY=
S3_REGION=
S3_ENDPOINT=
S3_PUBLIC_URL=
```

Recommended storage providers:

- Cloudflare R2
- AWS S3
- DigitalOcean Spaces
- Backblaze B2 S3-compatible storage

Status:

This is the main current blocker for completing company verification end-to-end in production.

## 6. Backend Security Behavior

The following backend behavior is now active:

- New company accounts default to unverified.
- Unverified companies cannot post jobs.
- Unverified companies cannot edit jobs.
- Unverified companies cannot access applicant data.
- Admin can approve or reject company verification.
- Admin decisions are written into audit logs.
- Company verification document metadata is stored separately from company profile data.

This moves the project closer to an enterprise recruiter trust model.

## 7. Explainable AI Persistence Update

The next enterprise slice has started: generated candidate gap reports are now stored as normalized AI explanation records.

Implemented behavior:

- New applications still save `gapReportJson` for backward compatibility.
- The same generated report is now also written into `ai_explanations`.
- Application API responses include `aiExplanations`.
- The application detail page prefers the persisted `GAP_REPORT` explanation and falls back to old gap report JSON when needed.
- Company rejection decisions now write a persisted `REJECTION_REASON` explanation alongside `Application.rejectionReason`.
- The application detail page displays the persisted rejection explanation for rejected candidates.
- Persisted explanations include confidence, prompt version, model name, generation source, strengths, missing skills, weak evidence, and recommendations.

Relevant files:

```txt
apps/api/src/lib/aiExplanations.ts
apps/api/src/lib/serializers.ts
apps/api/src/routes/applications.ts
apps/web/src/lib/normalize.ts
apps/web/src/pages/ApplicationDetailPage.tsx
packages/types/src/index.ts
```

## 8. Verification Performed

The following checks passed after the latest changes:

```sh
pnpm --filter @skillgap/web typecheck
pnpm --filter @skillgap/web build
pnpm --filter @skillgap/api typecheck
pnpm --filter @skillgap/api build
DATABASE_URL='postgresql://user:pass@localhost:5432/skillgap' pnpm --filter @skillgap/api exec prisma validate --schema prisma/schema.prisma
```

## 8. Current Blockers

### Blocker 1: S3/R2 Storage Is Not Configured

Until S3-compatible storage is configured, verification document upload will return:

```txt
501 Resume uploads are not configured yet
```

The message comes from the shared storage configuration check. Functionally, it means verification uploads are not configured.

Required action:

Configure S3/R2 environment variables in Render and redeploy.

### Blocker 2: Admin Account Availability

The admin console requires a user with:

```txt
role = ADMIN
```

Required action:

Ensure at least one admin user exists in the database.

### Blocker 3: Migration Must Be Applied On Render

The enterprise schema migration must be applied to production PostgreSQL.

Render build command should include:

```sh
pnpm --filter @skillgap/api migrate:deploy
```

## 9. Recommended Next Steps

Immediate next steps:

1. Configure Cloudflare R2 or AWS S3.
2. Add the S3/R2 env vars to Render.
3. Redeploy the API.
4. Create or promote an admin user.
5. Register a test company.
6. Upload verification documents from `/company/verification`.
7. Submit verification.
8. Approve the company from `/admin`.
9. Confirm the company can post jobs and view applicants.

After verification works end-to-end:

1. Add admin signed document preview/download.
2. Add malware scan provider placeholder UI.
3. Add structured rejection reason taxonomy.
4. Start Phase 3: persistent AI explanations in `ai_explanations`.
5. Add candidate-facing AI feedback and learning roadmap views.

## 10. Current Enterprise Progress

Completed:

- Enterprise schema foundation
- Company verification data model
- Company verification APIs
- Admin verification APIs
- Company verification page
- Admin verification console
- Applicant-data verification gate
- Verification-required UI handling
- Audit log foundation

Pending:

- Production S3/R2 configuration
- Admin user setup with `pnpm --filter @skillgap/api admin:promote <email>`
- End-to-end production verification test
- Signed document access through `GET /api/admin/verification-documents/:id/read-url`
- Fraud scoring logic
- Persistent AI explanation write path
- Candidate learning roadmap UI
