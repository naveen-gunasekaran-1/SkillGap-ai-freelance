# SkillGap AI Production Readiness Audit

Last updated: 2026-05-16

## Scope

This audit covers auth, role navigation, route guards, verification state, session persistence, mobile consistency, API usage, and production UX behavior.

## Findings And Fixes Implemented

### 1. Role Navigation Was Candidate-Biased

Root cause:

The public `Navbar` used one authenticated nav array, which was candidate-shaped. Admin was also treated like company in several shell components.

Fix:

- Added explicit candidate, company, admin, and public nav models.
- Updated `Navbar`, `Sidebar`, `MobileBottomNav`, `AppShell`, and `Topbar`.
- Admin routes now show admin-specific navigation.
- Company users no longer see candidate Applications/Dashboard nav.

Expected behavior:

```txt
Candidate -> Jobs, Applications, Dashboard, Profile
Company   -> Dashboard, Manage Jobs, Applicants, Pipeline, Verification, Company Profile
Admin     -> Admin Dashboard, Verification Queue, Audit Logs, Fraud Flags
Public    -> Home, Features, Pricing, Login, Register
```

### 2. Verification Status Names Were Not Product-Safe

Root cause:

The first enterprise schema used implementation terms like `DRAFT`, `IN_REVIEW`, and `APPROVED`. Product requirements call for clearer enterprise trust states.

Fix:

- Normalized status vocabulary:

```txt
NOT_STARTED
IN_PROGRESS
SUBMITTED
UNDER_REVIEW
VERIFIED
REJECTED
SUSPENDED
```

- Added migration to rename existing status values.
- Updated API middleware and UI checks to use `VERIFIED`.
- Company profile no longer displays verified unless both conditions are true:

```txt
company.isVerified === true
company.verificationStatus === "VERIFIED"
```

### 3. Admin Entry Was Publicly Exposed

Root cause:

Landing page footer linked directly to `/admin`.

Fix:

- Removed public admin footer link.
- Kept `/admin` as a hidden protected route.
- Frontend guard requires `ADMIN`.
- Backend admin routes require `requireAuth()` and `requireRoles(ADMIN)`.

### 4. Auth State Persisted Too Aggressively

Root cause:

The web auth store persisted user state with Zustand regardless of Remember Me state. Tokens were always stored in `localStorage`.

Fix:

- Removed persisted user store.
- Added runtime-only auth state with explicit bootstrap status.
- Added session-only token storage when Remember Me is unchecked.
- Added local persistent token storage only when Remember Me is checked.
- Login now sends `rememberMe` to API.
- API refresh-token lifetime:
  - Remember Me: 30 days
  - No Remember Me: 12 hours

Remaining production recommendation:

- Move web refresh tokens to httpOnly cookies in a future backend/web deployment pass.

### 5. Route Guards Could Flicker During Bootstrap

Root cause:

`ProtectedRoute` checked token existence before auth bootstrap completed, causing stale role behavior and possible redirects before `/auth/me` returned.

Fix:

- Added `bootstrapping | authenticated | anonymous` auth status.
- Protected routes now render a skeleton during bootstrap.
- Role mismatch redirects are now role-specific:
  - Admin -> `/admin`
  - Company -> `/company`
  - Candidate -> `/dashboard`

### 6. Unverified Companies Triggered Unauthorized API Spam

Root cause:

Company dashboard, candidate review, and pipeline pages called `/applications` before checking verification status.

Fix:

- Added `useCompanyTrust()`.
- Added `VerificationRequiredCard`.
- Disabled protected applicant queries until company is verified.
- Unverified companies now see a clear verification CTA.

### 7. Mobile Auth Cleanup Was Incomplete

Root cause:

Mobile startup attempted `/auth/me`, but invalid tokens were not fully cleared on failure.

Fix:

- Mobile startup now clears secure tokens and auth store on failed restore.
- Mobile tabs now label admin/company/candidate surfaces differently.

## Verification Performed

```sh
pnpm --filter @skillgap/api typecheck
pnpm --filter @skillgap/web typecheck
pnpm --filter @skillgap/mobile typecheck
pnpm --filter @skillgap/api build
pnpm --filter @skillgap/web build
DATABASE_URL='postgresql://user:pass@localhost:5432/skillgap' pnpm --filter @skillgap/api exec prisma validate --schema prisma/schema.prisma
```

All checks passed.

## Remaining Production Hardening Work

High priority:

- Configure S3/R2 storage on Render for verification document uploads.
- Add admin user creation/promote command. Completed with `pnpm --filter @skillgap/api admin:promote <email>`.
- Add signed admin document preview/download. Completed with admin-only signed read URLs.
- Add password reset implementation.
- Add email verification implementation.
- Add auth audit logs for login, refresh, logout, and suspicious login.
- Add CSRF strategy when httpOnly cookie refresh flow is introduced.

## New Operational Commands

Promote an existing user to admin:

```sh
pnpm --filter @skillgap/api admin:promote user@example.com
```

The command sets:

```txt
role = ADMIN
companyId = null
```

and writes an audit log entry.

## Secure Document Review

Verification documents remain private in S3-compatible storage. Admins can request a short-lived signed read URL:

```txt
GET /api/admin/verification-documents/:id/read-url
```

The URL expires after 5 minutes and the action writes an audit log entry:

```txt
VERIFICATION_DOCUMENT_VIEWED
```

Medium priority:

- Add API integration tests with Supertest.
- Add Playwright smoke tests for candidate/company/admin flows.
- Add mobile verification status screen.
- Add structured rejection reason taxonomy.
- Add persistent AI explanation dual-write into `ai_explanations`. Completed for application gap reports.

## Explainable AI Persistence

Application creation now dual-writes explainability output:

```txt
legacy compatibility: Application.gapReportJson
enterprise record:    ai_explanations(type = GAP_REPORT)
```

Application rejection now also writes an auditable explanation:

```txt
status change:      Application.status = REJECTED
plain compatibility: Application.rejectionReason
enterprise record:  ai_explanations(type = REJECTION_REASON)
```

The API includes `aiExplanations` in application responses. The web application detail page prefers persisted explanation records and falls back to legacy fields for older applications.

Security note:

Current access and refresh token handling is improved but still not the final enterprise pattern for web. The recommended production target is:

```txt
access token: short-lived in memory
refresh token: httpOnly Secure SameSite cookie
CSRF: double-submit token or SameSite strict/lax strategy
session/device: DB-backed refresh token family
```
