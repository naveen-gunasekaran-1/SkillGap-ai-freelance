# SkillGap AI Enterprise Upgrade Roadmap

Last updated: 2026-05-16

## Product North Star

SkillGap AI should evolve from an AI-assisted hiring MVP into explainable AI hiring infrastructure.

The wedge is mandatory rejection explainability:

- Recruiters must provide structured, auditable rejection reasons.
- Candidates receive evidence-based feedback and learning roadmaps.
- Companies get compliance-ready hiring records.
- Admins can verify companies, review fraud risk, and audit recruiter behavior.

## Phase 1: Architecture Audit And Foundation

Status: in progress.

Completed in this phase:

- Audited API, schema, auth, uploads, AI, and role-aware UI.
- Added enterprise schema foundation to Prisma.
- Added SQL migration for enterprise foundation.
- Documented refactor and migration strategy.

Deliverables:

- [ENTERPRISE_ARCHITECTURE_AUDIT.md](ENTERPRISE_ARCHITECTURE_AUDIT.md)
- Prisma schema additions in `apps/api/prisma/schema.prisma`
- Migration `20260516150000_enterprise_foundation`

## Phase 2: Company Verification System

Status: backend foundation and first web workflow started.

Goal: companies must be verified before posting jobs or viewing candidate-sensitive information.

Backend work:

- [x] Default new company accounts to unverified.
- [x] Add `requireVerifiedCompany()` middleware.
- [x] Add verification document upload API.
- [x] Add verification submission API.
- [x] Add admin approval/rejection API.
- [x] Add audit log entries for key verification and recruiter actions.
- Add fraud flag generation hooks.
- Add signed document download URLs for admins.
- Add malware scan provider integration.

Web work:

- [x] Company verification page.
- [x] Admin verification queue.
- [x] Admin verification detail view.
- [x] Admin approve/reject decision controls.
- [x] Admin audit log view.
- [x] Admin fraud flag view.
- Verification status banner.
- Upload checklist by country.
- Admin document review screen.

Mobile work:

- Verification status view.
- Basic verification prompt and web handoff for document upload.

Tests:

- Company cannot post jobs before verification.
- Admin can approve verification.
- Approved company can post jobs.
- Rejected verification returns structured rejection reason.

## Phase 3: Explainable AI Engine

Goal: turn gap-preview into a persistent explainability system.

Backend work:

- Add `explainabilityService`.
- Dual-write generated reports into `ai_explanations`.
- Add explanation types:
  - `GAP_REPORT`
  - `REJECTION_REASON`
  - `LEARNING_ROADMAP`
  - `WEAK_EVIDENCE`
- Add confidence and prompt version metadata.
- Add deterministic fallback when OpenAI is unavailable.

Web work:

- Candidate application explainability panel.
- Recruiter-side evidence gap panel.
- Rejection explanation preview before final rejection.

Mobile work:

- Candidate AI feedback view on applications.

Tests:

- AI explanation is created on application.
- AI explanation includes missing skills, weak evidence, strengths, and recommendations.
- Fallback works without OpenAI configuration.

## Phase 4: Learning Roadmap Engine

Goal: generate personalized candidate improvement roadmaps.

Inputs:

- Missing skills.
- Target role.
- Candidate experience.
- Candidate availability.

Outputs:

- Project recommendations.
- Course/certification recommendations.
- Timeline.
- Interview prep.
- GitHub portfolio ideas.

Implementation:

- Add `learningRoadmapService`.
- Store roadmaps as `AiExplanation` with type `LEARNING_ROADMAP`.
- Add candidate roadmap UI.

## Phase 5: Admin Dashboard

Goal: make the platform operationally safe.

Admin modules:

- Verification queue.
- Fraud flags.
- Recruiter activity logs.
- Audit logs.
- AI moderation alerts.
- Legal compliance monitor.

Backend routes:

```txt
GET   /api/admin/verifications
PATCH /api/admin/verifications/:id/decision
GET   /api/admin/fraud-flags
PATCH /api/admin/fraud-flags/:id
GET   /api/admin/audit-logs
GET   /api/admin/recruiter-activity
```

## Phase 6: Legal And Compliance

Goal: make the product trustworthy for candidates, recruiters, and enterprise buyers.

Pages:

- Privacy Policy.
- Terms & Conditions.
- Cookie Policy.
- AI Transparency Policy.
- Candidate Rights Policy.
- Recruiter Compliance Policy.
- GDPR Compliance.
- Security Policy.
- Data Retention Policy.

Backend:

- Persist legal acceptances.
- Persist cookie consents.
- Track policy versions.

## Phase 7: Cookie Consent System

Goal: GDPR-style consent separation.

Features:

- Cookie banner.
- Preference center.
- Essential, analytics, marketing, and preference categories.
- Consent record persistence.

## Phase 8: Premium Landing Pages

Goal: investor-demo quality positioning around explainable hiring.

Landing message direction:

```txt
73% of rejected candidates never receive actionable hiring feedback.
SkillGap AI turns every hiring decision into an explainable, auditable improvement loop.
```

Required sections:

- Hero.
- Problem.
- Solution.
- AI explainability.
- Workflow.
- Recruiter flow.
- Candidate flow.
- Metrics.
- Testimonials.
- Pricing.
- FAQ.
- Security/compliance.
- CTA.
- Footer.

## Phase 9: Database And Schema Upgrades

Status: initial foundation implemented.

Added tables:

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

Future schema upgrades:

- Organization/team model.
- Billing/subscription model.
- Structured rejection taxonomy.
- AI prompt/version registry.
- Async AI job table.

## Phase 10: AI Microservice Architecture

Do not split immediately. First stabilize contracts inside the API.

Target services:

```txt
services/ai-service
services/embedding-service
services/recommendation-service
```

Future stack:

- FastAPI.
- Python.
- sentence-transformers.
- OpenAI embeddings.
- Async queues.

## Phase 11: Security Hardening

Immediate:

- Add capability guards.
- Add audit logs.
- Private verification documents.
- Signed URLs.
- Recruiter activity logging.

Near term:

- Malware scan integration.
- Suspicious recruiter detection.
- Stronger CORS allowlist in production.
- Security headers review.
- API validation coverage.

## Phase 12: Mobile Improvements

High-value additions:

- Company job create/edit.
- Verification status.
- Recruiter dashboard.
- Candidate AI explanation detail.
- Push notifications.

## Phase 13: DevOps And Scaling

Add:

- Dockerfile per app.
- Docker Compose for local stack.
- GitHub Actions for typecheck/build/test.
- Production env documentation.
- Render deployment hardening.

## Phase 14: Testing

Priority order:

1. API integration tests with Supertest.
2. Web smoke tests with Playwright.
3. Unit tests for matching/explainability services.
4. Mobile typecheck and critical flow tests.

Minimum enterprise smoke suite:

- Register candidate.
- Register company.
- Company blocked before verification.
- Admin verifies company.
- Company posts job.
- Candidate applies.
- AI explanation generated.
- Company rejects with structured reason.
- Candidate sees explanation and roadmap.
