# SkillGap AI Enterprise Architecture Audit

Last updated: 2026-05-16

## Executive Assessment

SkillGap AI is a functional production-style MVP with the correct core shape for an explainable hiring platform: monorepo, Express API, Prisma/PostgreSQL, JWT auth, role-aware web/mobile clients, job/application flows, and an initial AI gap-preview endpoint.

The product can evolve into enterprise-grade explainable hiring infrastructure without a rewrite. The right strategy is a staged hardening path:

1. Preserve the existing API/auth/job/application foundations.
2. Add enterprise trust data models and auditability.
3. Gate high-risk recruiter actions behind company verification.
4. Move AI output from transient JSON blobs into versioned, auditable explanation records.
5. Add admin workflows for verification, fraud, compliance, and AI review.
6. Extract heavier AI workloads behind service boundaries only after the core API contract is stable.

## Current Strengths

- Monorepo boundaries are clear: `apps/api`, `apps/web`, `apps/mobile`, `packages`.
- API uses Prisma and PostgreSQL, which is suitable for SaaS transactional data.
- JWT auth and refresh-token persistence already exist.
- Candidate, company, and admin roles are already represented.
- Job and application flows are implemented and wired to web/mobile.
- Candidate skill matching and gap reports already exist as a baseline AI engine.
- Web app has reusable UI package components and role-protected routes.
- Mobile app now stores role state and switches behavior for candidate vs company users.
- Render deployment path is working.

## Primary Weak Points

### 1. Company Trust Is Too Permissive

Current company registration marks companies as verified immediately. This is not acceptable for an enterprise hiring product.

Impact:

- Unverified recruiters can post jobs.
- Unverified companies can access applicant data.
- Fraudulent companies have no review workflow.

Required direction:

- Default companies to `NOT_STARTED` or `PENDING`.
- Require verification before posting jobs, viewing candidate details, and using hiring analytics.
- Add admin approval/rejection flow.

### 2. AI Explainability Is Not Auditable Enough

Current gap reports are stored as `Application.gapReportJson`. This is useful for MVP delivery, but not sufficient for explainable hiring infrastructure.

Impact:

- No model version tracking.
- No prompt version tracking.
- No confidence score history.
- No separation between candidate-facing, recruiter-facing, and rejection explanations.

Required direction:

- Store AI output in `ai_explanations`.
- Version prompts and models.
- Track missing skills, weak evidence, strengths, recommendations, and raw model output.
- Preserve backward compatibility by keeping `gapReportJson` until migration is complete.

### 3. Rejection Reasons Need Structure

Current rejection flow requires a plain text reason for `REJECTED`, which is a good starting point. Enterprise explainability needs structured reason categories, evidence gaps, missing skills, and candidate-safe wording.

Required direction:

- Add rejection explanation generation.
- Require recruiter-selected structured categories.
- Store candidate-visible and internal recruiter notes separately.
- Audit every rejection status transition.

### 4. Upload Security Is MVP-Level

Resume upload uses S3-style object storage and currently returns public URLs. Verification documents need stricter handling.

Required direction:

- Store private object keys, not public URLs, for verification documents.
- Add signed download URLs.
- Add checksum tracking.
- Add malware scan status placeholder.
- Add encryption key metadata.
- Add audit logs for every document access.

### 5. Admin System Is Not Enterprise-Ready

Admin UI currently exists as a shell, but there is no deep admin backend for verification, fraud, audit logs, or legal monitoring.

Required direction:

- Verification review queue.
- Fraud review queue.
- Recruiter activity monitoring.
- AI moderation alerts.
- Legal acceptance and cookie consent views.

### 6. Compliance Layer Is Missing

No persistent legal acceptance, cookie consent, or policy version tracking exists yet.

Required direction:

- Add policy pages.
- Add legal acceptance records.
- Add cookie preference center.
- Record IP, user agent, policy version, and consent choices.

### 7. AI Runtime Should Remain Modular Before Becoming Microservices

The current AI code is small enough to remain inside the API while contracts stabilize. A premature split would slow delivery.

Required direction:

- First isolate AI services inside `apps/api/src/lib` or `apps/api/src/services`.
- Then create `services/ai-service`, `services/embedding-service`, and `services/recommendation-service`.
- Use queues when workloads become slow or asynchronous.

## Technical Debt Inventory

| Area | Debt | Risk | Recommended Fix |
| --- | --- | --- | --- |
| Company registration | Auto-verifies companies | Fraud and compliance risk | Default to unverified; require admin approval |
| AI reports | Stored as application JSON | No audit/model history | Add `ai_explanations` table and dual-write |
| Uploads | Public URLs for stored files | Sensitive document exposure risk | Private storage keys + signed URLs |
| Admin | UI shell only | Cannot operate platform safely | Add admin review APIs and dashboards |
| Legal | Static/no tracking | Compliance evidence gap | Add legal acceptance/cookie consent records |
| Auth/RBAC | Role checks only | Missing capability-level authorization | Add policy helpers like `requireVerifiedCompany` |
| Observability | Morgan logs only | Weak incident/debug trail | Add audit logs and structured app logs |
| Testing | Limited automated coverage | Regression risk | Add API integration tests first |
| Mobile company tools | Role-aware but partial | Weak recruiter mobile experience | Add job create/edit and verification screens |

## Reusable Modules To Preserve

- `apps/api/src/middleware/auth.ts`: keep and extend with capability guards.
- `apps/api/src/lib/matching.ts`: keep as deterministic baseline scoring.
- `apps/api/src/lib/aiGapEnrichment.ts`: keep as model enrichment adapter, then refactor behind an explainability service.
- `apps/api/src/lib/storage.ts`: keep S3 client setup, extend for private verification documents.
- `apps/web/src/components/AppShell.tsx`, `Sidebar.tsx`, `ProtectedRoute.tsx`: keep role-aware shell and extend admin/company nav.
- `packages/ui`: keep as shared component foundation.
- `packages/types`: keep as the source of shared domain DTOs.

## Missing Enterprise Systems

- Company verification workflow.
- Private verification document storage.
- Admin review queue.
- Fraud flags.
- Audit logs.
- Recruiter activity logs.
- AI explanation persistence.
- Structured rejection reason taxonomy.
- Cookie consent and preference center.
- Legal acceptance tracking.
- Policy/legal page system.
- Capability-level RBAC.
- API integration tests.
- Docker/GitHub Actions deployment baseline.

## Refactor Strategy

### Principle 1: Add Before Replacing

Do not remove `Application.gapReportJson` immediately. Add `AiExplanation` and dual-write, then migrate old records later.

### Principle 2: Capability Guards Over Hardcoded Checks

Keep role checks, but add explicit guards:

```txt
requireVerifiedCompany()
requireCompanyOwner()
requireAdminReviewPermission()
```

### Principle 3: Separate Sensitive Storage From Public Uploads

Keep resume upload behavior stable for now. Add separate verification document upload methods that never return public URLs.

### Principle 4: Make AI Explainability Versioned

Every AI explanation should include:

- explanation type
- model
- prompt version
- confidence
- input/output metadata
- created timestamp

### Principle 5: Build Admin Operations Before Advanced AI

The platform cannot safely sell enterprise hiring infrastructure until admins can verify companies and audit recruiter behavior.

## Migration Strategy

### Step 1: Enterprise Schema Foundation

Status: started.

Added additive Prisma models for:

- `company_verifications`
- `verification_documents`
- `ai_explanations`
- `audit_logs`
- `recruiter_activity_logs`
- `cookie_consents`
- `fraud_flags`
- `admin_reviews`
- `legal_acceptances`
- `skill_embeddings`

### Step 2: Verification Enforcement

Add API guard:

```txt
requireVerifiedCompany()
```

Apply it to:

- `POST /api/jobs`
- `PUT /api/jobs/:id`
- company applicant detail endpoints
- company analytics endpoints

### Step 3: Admin Review APIs

Add routes:

```txt
GET   /api/admin/verifications
GET   /api/admin/verifications/:id
PATCH /api/admin/verifications/:id/decision
GET   /api/admin/audit-logs
GET   /api/admin/fraud-flags
```

### Step 4: Explainability Dual-Write

When application gap reports are generated:

- keep writing `Application.gapReportJson`
- also write `AiExplanation`

### Step 5: UI Enablement

Add:

- company verification page
- admin verification queue
- explainability panel on candidate application detail
- structured rejection modal for recruiters

### Step 6: AI Service Extraction

Only after stable API contracts:

```txt
services/ai-service
services/embedding-service
services/recommendation-service
```

## Scalability Roadmap

### 0-2 Weeks

- Finish verification backend and admin review UI.
- Add company verification gate to job posting and candidate access.
- Add audit log utility and log critical actions.
- Add AI explanation persistence.
- Add legal pages and cookie consent.

### 2-6 Weeks

- Add structured rejection reason engine.
- Add learning roadmap generator.
- Add admin analytics and fraud review.
- Add API integration tests with Supertest.
- Add Playwright smoke tests for candidate/company flows.

### 6-12 Weeks

- Add async AI job queue.
- Add embeddings table population.
- Add resume semantic parsing pipeline.
- Add private signed document access.
- Add Docker Compose and CI pipeline.

### 3-6 Months

- Split AI workloads into Python services.
- Add queue workers.
- Add observability and alerting.
- Add organization/team billing primitives.
- Add SSO/SAML for enterprise customers.

## Immediate Next Implementation Slice

The next high-value implementation slice should be:

1. Add verification status defaults to company registration.
2. Add `requireVerifiedCompany()` middleware.
3. Block company job posting until verified.
4. Add company verification submit/upload APIs.
5. Add admin verification review APIs.
6. Add web company verification page and admin verification queue.
