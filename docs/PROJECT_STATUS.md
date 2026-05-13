# Project Status

## Overview
- Monorepo with API, web, and mobile apps plus shared packages.
- Primary user flows: authentication, job discovery, applications, and AI gap analysis.

## What Is Implemented
- API: auth, jobs, applications, companies, and AI gap preview endpoints are live in [apps/api/src/routes](apps/api/src/routes).
- API: JWT access/refresh tokens with DB-backed refresh tokens in [apps/api/src/routes/auth.ts](apps/api/src/routes/auth.ts).
- API: gap report computation and optional OpenAI enrichment in [apps/api/src/lib/matching.ts](apps/api/src/lib/matching.ts) and [apps/api/src/lib/aiGapEnrichment.ts](apps/api/src/lib/aiGapEnrichment.ts).
- Web: authentication and main candidate flows wired to API in [apps/web/src/pages](apps/web/src/pages).
- Mobile: login, jobs list, and applications list are API-backed in [apps/mobile/app/(auth)/login.tsx](apps/mobile/app/(auth)/login.tsx), [apps/mobile/app/(tabs)/jobs.tsx](apps/mobile/app/(tabs)/jobs.tsx), and [apps/mobile/app/(tabs)/applications.tsx](apps/mobile/app/(tabs)/applications.tsx).

## What Is Partial / Placeholder
- Web: password reset is a placeholder page in [apps/web/src/pages/ForgotPasswordPage.tsx](apps/web/src/pages/ForgotPasswordPage.tsx).
- Web: company portal and admin panel are UI shells in [apps/web/src/pages/CompanyPortal.tsx](apps/web/src/pages/CompanyPortal.tsx) and [apps/web/src/pages/AdminPanel.tsx](apps/web/src/pages/AdminPanel.tsx).
- Mobile: some screens remain UI-first (dashboard/profile) in [apps/mobile/app/(tabs)](apps/mobile/app/(tabs)).

## Data Storage
- SQLite via Prisma. Provider is configured in [apps/api/prisma/schema.prisma](apps/api/prisma/schema.prisma#L5-L8).
- DB file location comes from `DATABASE_URL` in the server env.

## Mobile + Web Alignment
- Mobile theme tokens aligned to the web design system in [apps/mobile/src/theme.ts](apps/mobile/src/theme.ts).
- Web theme tokens live in [apps/web/src/index.css](apps/web/src/index.css).

## Security / Reliability Notes
- Access tokens are stored in browser local storage in [apps/web/src/lib/api.ts](apps/web/src/lib/api.ts).
- OpenAI calls are guarded with a timeout in [apps/api/src/lib/aiGapEnrichment.ts](apps/api/src/lib/aiGapEnrichment.ts).

## Suggested Next Steps
- Implement real password reset flow (API + email).
- Add write operations for company/admin features.
- Expand mobile parity for dashboard/profile data.
- Finalize deployment/testing docs in [docs](docs).
