# SkillGap AI Enterprise Productionization Audit

Last updated: 2026-05-16

## Executive Summary

SkillGap AI has a strong production-style MVP foundation: monorepo architecture, Express API, Prisma/PostgreSQL, JWT auth, role-aware web/mobile behavior, company verification, admin review tooling, private object-storage integration, and early persistent AI explainability records.

The product is not yet enterprise-launch ready. The main remaining gap is not one single bug; it is a set of consistency, trust, security, and polish work that needs to be completed in controlled slices without rewriting the system.

Recommended next operating principle:

```txt
Preserve the working core. Upgrade the visible workflows and trust boundaries first.
```

## Current Completion Estimate

```txt
MVP demo readiness:        70%
Investor demo readiness:   55%
Production SaaS readiness: 40%
Enterprise readiness:      30%
```

## Architecture Audit

Strengths:

- Existing monorepo separation is sensible: `apps/api`, `apps/web`, `apps/mobile`, `packages`.
- API routes are domain-oriented and already use Prisma relations.
- Shared types package keeps frontend/backend contracts aligned.
- Enterprise schema foundation exists for verification, audit logs, fraud flags, legal acceptances, cookie consents, and AI explanations.
- Render/Postgres deployment path is already proven.

Weak points:

- AI logic is still inside the main API and should eventually move behind a service boundary.
- Application explainability is partially normalized but recruiter-facing evidence views are incomplete.
- There is no robust automated test suite around auth, verification gates, application creation, and rejection flows.
- Dist output appears in the working tree and should not be committed as source.

Architecture decision:

Keep the Express API as the system of record for now. Add clean service modules and integration tests before extracting AI microservices. Premature extraction would slow the project.

## UX Audit

Critical issues found:

- Candidate registration form uses a narrow `max-w-lg` layout even when step 4 contains dense professional history fields.
- Emoji icons remain in landing, login, registration, and company portal demo UI.
- Public navbar is missing required enterprise navigation items: For Companies and Security.
- Landing copy is still partly generic career-app language instead of recruiter-accountability positioning.
- Landing footer links include private routes such as Dashboard.

Immediate UX fix order:

1. Auth/register layout polish and emoji replacement.
2. Public navbar separation and landing/footer route cleanup.
3. Recruiter applicant review with explainability panels. Completed for web company review.
4. Structured rejection workflow. Completed for web company review and API payload persistence.
5. Enterprise landing page rebuild.

## Security Audit

Strengths:

- JWT auth exists.
- Role guards exist in backend and frontend.
- Company verification gates protect candidate/applicant data.
- Audit logs exist for important auth and verification actions.
- Signed URLs exist for private verification document review.

Remaining risks:

- Web refresh tokens are still client-managed. The long-term enterprise target is httpOnly Secure SameSite cookie refresh tokens with CSRF strategy.
- Password reset and email verification are not complete production flows.
- Session/device tracking needs a stronger user-facing management surface.
- Brute-force and suspicious-login detection should be expanded beyond basic rate limiting.
- Object upload malware scanning is a placeholder, not a provider integration.

## Auth And Session Audit

Current behavior:

- Login supports Remember Me.
- Session-only vs persistent storage behavior exists on web.
- Mobile restores auth and clears invalid tokens.
- Role-specific redirect exists after login.

Required next hardening:

- Add password reset token table and endpoints.
- Add email verification token flow.
- Add audit logs for reset request, reset complete, verification sent, verification complete.
- Add refresh token rotation tests.
- Move refresh token to httpOnly cookie for web when deployment config is ready.

## Navigation Audit

Current behavior:

- Private app shells are role-aware.
- Mobile bottom navigation is role-aware.
- Public navbar still needs enterprise public links.

Required target:

```txt
Public:    Home, Features, For Companies, Pricing, Security, Login, Get Started
Candidate: Dashboard, Jobs, Applications, Learning Roadmap, Profile
Company:   Dashboard, Jobs, Applicants, Pipeline, Verification, Company Profile
Admin:     Verification Queue, Audit Logs, Fraud Flags, Admin Dashboard
```

## Verification Audit

Strengths:

- Verification states are normalized.
- New companies default to unverified.
- Unverified companies are blocked from job posting and applicant data.
- Admin review flow exists.
- R2/S3-compatible storage docs and config exist.

Remaining work:

- Complete production storage validation inside admin UI.
- Add upload MIME/size tests.
- Add malware scan provider placeholder status to document metadata.
- Add mobile verification progress screen.

## AI Architecture Audit

Current behavior:

- Gap preview exists.
- Application creation generates a gap report.
- Gap reports now persist to `ai_explanations`.
- Rejection decisions now persist `REJECTION_REASON` explanation records.

Remaining work:

- Recruiter-side evidence gap panel.
- Structured rejection category taxonomy.
- Learning roadmap generation as `LEARNING_ROADMAP`.
- Embedding-based semantic resume/JD matching.
- AI audit view for admin.
- Dedicated AI service extraction after test coverage exists.

## Production Roadmap

### Phase 1: Visible Trust And UX

- Fix auth/register layouts.
- Remove emoji icons.
- Fix public/private navigation.
- Rewrite landing content around explainable hiring.
- Polish applicant review.
- Add structured rejection workflow.

### Phase 2: Security And Account Recovery

- Password reset.
- Email verification.
- Auth integration tests.
- Better suspicious-login audit metadata.
- httpOnly cookie refresh strategy for web.

### Phase 3: Recruiter Explainability

- Evidence gap panel.
- Rejection categories.
- Candidate-facing rejection explanation preview.
- Admin AI/rejection audit.

### Phase 4: AI Roadmaps

- Learning roadmap records.
- Project recommendations.
- Certification recommendations.
- Interview prep plans.
- Semantic skill extraction.

### Phase 5: Production Infrastructure

- Docker and Docker Compose.
- GitHub Actions.
- Playwright smoke tests.
- Supertest API tests.
- Monitoring hooks.
- Deployment runbooks.

### Phase 6: SaaS Commercialization

- Pricing page.
- Stripe subscriptions.
- Webhooks.
- Usage limits.
- Billing portal.

## Immediate Implementation Slice

The first implementation slice should be:

```txt
Enterprise web UX cleanup:
- registration layout
- public navbar
- emoji icon replacement
- landing/footer private-link cleanup
```

Reason:

This fixes the highest-visibility investor-demo problems without risky backend changes.
