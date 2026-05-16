# Enterprise Schema Improvement Plan

Last updated: 2026-05-16

## Purpose

This document explains the enterprise schema layer added to SkillGap AI and how it should be used during the next implementation phases.

The schema is additive. Existing user, company, job, and application flows remain compatible.

## Implemented Additions

### Company Verification

Tables:

- `company_verifications`
- `verification_documents`

Company fields:

- `verificationStatus`
- `verificationSubmittedAt`
- `verificationReviewedAt`

Purpose:

- Track verification lifecycle.
- Store country-specific document requirements.
- Support admin review and rejection.
- Keep sensitive document metadata separate from public company profile data.

Initial status model:

```txt
NOT_STARTED
DRAFT
SUBMITTED
IN_REVIEW
APPROVED
REJECTED
SUSPENDED
```

### AI Explanations

Table:

- `ai_explanations`

Purpose:

- Store AI gap reports.
- Store rejection explanations.
- Store learning roadmaps.
- Track model, prompt version, confidence, and output payload.

Initial explanation types:

```txt
GAP_REPORT
REJECTION_REASON
LEARNING_ROADMAP
WEAK_EVIDENCE
```

### Audit And Activity

Tables:

- `audit_logs`
- `recruiter_activity_logs`

Purpose:

- Record sensitive state transitions.
- Track recruiter behavior.
- Support fraud detection and compliance review.

High-priority audit actions:

```txt
COMPANY_VERIFICATION_SUBMITTED
COMPANY_VERIFICATION_APPROVED
COMPANY_VERIFICATION_REJECTED
JOB_CREATED
JOB_UPDATED
APPLICATION_STATUS_CHANGED
APPLICATION_REJECTED
VERIFICATION_DOCUMENT_UPLOADED
VERIFICATION_DOCUMENT_VIEWED
```

### Compliance

Tables:

- `cookie_consents`
- `legal_acceptances`

Purpose:

- Store cookie preferences.
- Track accepted legal policy versions.
- Support GDPR-style evidence records.

### Fraud And Admin Review

Tables:

- `fraud_flags`
- `admin_reviews`

Purpose:

- Review suspicious companies/recruiters/documents.
- Create admin queues for verification and moderation.
- Keep decisions and notes out of core business tables.

### Skill Embeddings

Table:

- `skill_embeddings`

Purpose:

- Store semantic skill vectors.
- Enable hidden skill inference.
- Enable better job/resume matching.

Implementation note:

- Embeddings are stored as JSON initially for portability.
- Later production systems can move to pgvector or a vector database.

## Migration

Migration file:

```txt
apps/api/prisma/migrations/20260516150000_enterprise_foundation/migration.sql
```

Apply locally:

```sh
pnpm --filter @skillgap/api migrate:deploy
```

If local `.env` still contains an old SQLite URL, use a PostgreSQL URL while validating or applying this migration:

```sh
DATABASE_URL='postgresql://user:pass@localhost:5432/skillgap' pnpm --filter @skillgap/api exec prisma validate --schema prisma/schema.prisma
```

Apply on Render:

```sh
corepack enable && corepack prepare pnpm@9.0.0 --activate && pnpm install --frozen-lockfile --prod=false && pnpm --filter @skillgap/api migrate:deploy && pnpm --filter @skillgap/api build
```

## Backward Compatibility

The following legacy fields remain:

```txt
Company.isVerified
Company.verificationBadge
Application.gapReportJson
Application.rejectionReason
```

These fields should not be removed yet.

Recommended migration approach:

1. Keep existing fields for current UI/API compatibility.
2. Add dual-write to new enterprise tables.
3. Update UI to prefer new tables.
4. Backfill old data.
5. Deprecate legacy fields later.

## Next Schema Work

Recommended next additions after the foundation is active:

- `rejection_reason_templates`
- `application_rejection_explanations`
- `ai_prompt_versions`
- `ai_jobs`
- `organizations`
- `organization_members`
- `subscriptions`
- `webhook_events`

Do not add these until verification and explainability APIs are implemented against the current foundation.

## Implemented API Consumers

The first API layer now uses this schema through:

```txt
GET    /api/companies/me/verification
POST   /api/companies/me/verification
POST   /api/companies/me/verification/documents
POST   /api/companies/me/verification/submit
GET    /api/admin/verifications
GET    /api/admin/verifications/:id
PATCH  /api/admin/verifications/:id/decision
GET    /api/admin/audit-logs
GET    /api/admin/fraud-flags
```

The first web page consuming the verification workflow is:

```txt
/company/verification
```
