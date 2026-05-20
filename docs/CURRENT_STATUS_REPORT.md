# SkillGap AI Current Status Report

Last updated: 2026-05-16 14:57 IST

## 1. Executive Summary

SkillGap AI is now a working monorepo with API, web, and mobile applications. The backend is deployed on Render, uses PostgreSQL, and exposes authentication, jobs, applications, companies, and AI gap-analysis features.

The latest local work focused on connecting the UI properly for both roles:

- Candidate web UI is API-backed for login, registration, jobs, applications, profile, and job details.
- Company web UI is now role-protected and API-backed for dashboard, job management, applicants, pipeline, and company profile.
- Mobile UI now stores the logged-in role and changes its jobs, applications/applicants, dashboard, and profile behavior for candidate vs company users.
- The fake web role slider behavior has been removed from the main app shell.
- Enterprise schema foundations and the first company verification workflow have been added.

Local verification currently passes for API, web, and mobile TypeScript checks. API and web production builds also pass.

## 2. Current Architecture

The project is organized as a pnpm monorepo:

```txt
apps/api      Express API with Prisma
apps/web      React/Vite web app
apps/mobile   Expo / React Native mobile app
packages      Shared packages and types
docs          Project documentation
```

Primary deployed backend:

```txt
https://skillgap-ai-freelance.onrender.com
```

Primary API base URL:

```txt
https://skillgap-ai-freelance.onrender.com/api
```

Health endpoint:

```txt
https://skillgap-ai-freelance.onrender.com/health
```

Expected health response:

```json
{ "status": "ok" }
```

## 3. Backend API Status

The API is implemented in:

```txt
apps/api
```

Implemented API areas:

- Authentication with JWT access and refresh tokens.
- Candidate registration and login.
- Company registration and login.
- Role-based API access for candidate, company, and admin users.
- Public job listing and job detail endpoints.
- Candidate application creation and application tracking.
- Company applicant listing and application status updates.
- Company profile read/update endpoints.
- Company-owned job create/update/list endpoints.
- AI gap-preview endpoint for candidate job matching.

Recently added or connected company endpoints:

```txt
GET    /api/companies/me
PATCH  /api/companies/me
GET    /api/jobs/company/mine
POST   /api/jobs
PUT    /api/jobs/:id
GET    /api/applications
PATCH  /api/applications/:id/status
```

New enterprise verification/admin endpoints:

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

Company accounts now default to unverified. Verified company status is required before company users can post/edit jobs or access applicant data.

The application serializer now includes candidate data on application responses where needed, so company applicant screens can show real candidate information instead of placeholder values.

## 4. Database Status

The API uses PostgreSQL through Prisma.

Current datasource target:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Current production database:

```txt
Render PostgreSQL
```

Render PostgreSQL connection logs have confirmed SSL-enabled connections from the API service.

Important note: old documentation may still mention SQLite in some places. The active deployment direction is PostgreSQL.

## 5. Render Deployment Status

Render Web Service:

```txt
SkillGap-ai-freelance
```

Render URL:

```txt
https://skillgap-ai-freelance.onrender.com
```

Current recommended Render build command:

```sh
corepack enable && corepack prepare pnpm@9.0.0 --activate && pnpm install --frozen-lockfile --prod=false && pnpm --filter @skillgap/api migrate:deploy && pnpm --filter @skillgap/api build
```

Current Render start command:

```sh
pnpm --filter @skillgap/api start
```

Important Render environment variables:

```env
NODE_ENV=production
DATABASE_URL=<Render PostgreSQL database URL>
JWT_ACCESS_SECRET=<long random secret>
JWT_REFRESH_SECRET=<long random secret>
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=30d
CORS_ORIGINS=*
```

Earlier deployment problems fixed:

- `prisma: not found` during Render build.
- SQLite/PostgreSQL datasource mismatch.
- Missing Prisma generation during deployment.
- CORS failure when web app called Render API from local Vite origin.

## 6. Web App Status

The web app is implemented in:

```txt
apps/web
```

Local web URL:

```txt
http://localhost:5173
```

Current web API configuration:

```txt
VITE_API_URL=https://skillgap-ai-freelance.onrender.com/api
```

Current web role behavior:

- Candidate login redirects to `/dashboard`.
- Company login redirects to `/company`.
- Candidate-only routes are protected from company users.
- Company-only routes are protected from candidate users.
- Admin can access protected role areas where allowed.

Candidate web pages currently connected to API:

- Login
- Registration
- Dashboard
- Jobs
- Job details
- Applications
- Application details
- Profile

Company web pages currently connected to API:

- Company dashboard: `/company`
- Company job listings: `/company/jobs`
- Post new job: `/company/jobs/new`
- Edit job: `/company/jobs/:jobId/edit`
- Candidate review: `/company/candidates`
- Hiring pipeline: `/company/pipeline`
- Company profile: `/company/profile`
- Company verification: `/company/verification`
- Admin verification console: `/admin`

Landing page navigation status:

- Public navbar no longer shows Jobs or Dashboard.
- The earlier public "For Companies" nav link was removed from the navbar as requested.
- A separate company intro page exists at `/for-companies`, but it is not currently shown in the navbar.

## 7. Mobile App Status

The mobile app is implemented in:

```txt
apps/mobile
```

The mobile app uses the same API base URL through:

```txt
EXPO_PUBLIC_API_URL
```

Important build note: `EXPO_PUBLIC_API_URL` is baked into the release APK at build time. If the API URL changes, the APK must be rebuilt and reinstalled.

Mobile role behavior now implemented:

- Login stores user role.
- Registration stores user role.
- App startup restores session and role from `/auth/me`.
- Tabs and labels change for candidate vs company users.
- Company users see `Applicants` instead of candidate `Applied` wording.
- Company jobs screen loads `/jobs/company/mine`.
- Candidate jobs screen loads public `/jobs`.
- Company profile screen shows company/profile/applicant/job context.
- Candidate profile screen shows candidate skills, applications, and match data.

Current mobile company management status:

- Mobile company users can create jobs from the Jobs tab.
- Mobile company users can open an existing job, edit the posting, and review applicants.
- Web remains the richer company management surface for verification/admin-heavy workflows.
- Release APK should be rebuilt after this latest role/API integration before testing on a physical device.

## 8. Current Local Runtime Status

At the time of this report, local servers were detected as running:

```txt
Web: http://localhost:5173
API: http://localhost:3001
```

Local API health check returned:

```json
{ "status": "ok" }
```

For physical-device local testing on the same Wi-Fi, the phone must use the PC LAN IP instead of `localhost`. For deployed testing, use the Render API URL.

## 9. Verification Completed

The following checks passed locally after the latest integration work:

```sh
pnpm --filter @skillgap/api typecheck
pnpm --filter @skillgap/web typecheck
pnpm --filter @skillgap/mobile typecheck
pnpm --filter @skillgap/api build
pnpm --filter @skillgap/web build
```

Additional enterprise foundation verification:

```sh
DATABASE_URL='postgresql://user:pass@localhost:5432/skillgap' pnpm --filter @skillgap/api exec prisma validate --schema prisma/schema.prisma
```

This validation requires a PostgreSQL-style `DATABASE_URL`. If local `.env` still points to an old SQLite file URL, Prisma validation will fail even though the production schema is valid for Render PostgreSQL.

Admin verification console verification:

```sh
pnpm --filter @skillgap/web typecheck
pnpm --filter @skillgap/web build
```

The admin console now loads verification submissions, document metadata, audit logs, and fraud flags from live admin APIs.

API build generated Prisma Client successfully.

Web production build completed successfully.

Mobile TypeScript check completed successfully.

## 10. Known Issues / Risks

Remaining risks and limitations:

- Some documentation files still contain older local-network or SQLite references and should be cleaned up.
- Mobile company management supports job creation/editing and applicant review, but the web app remains stronger for deep admin and verification workflows.
- Render free-tier services may sleep, causing slow first requests.
- Render free PostgreSQL is suitable for testing, not long-term production reliability.
- Old APKs may still point to an old API URL. Uninstall old APKs before testing a rebuilt release.
- Duplicate registration emails will correctly fail with an API error.
- Company profile fields are limited by the current database schema; fields like phone/location are not fully persisted unless schema support is added.

## 11. Current Git Working Tree Notes

There are many active local changes from the latest integration work across:

```txt
apps/api/src
apps/web/src
apps/mobile/app
apps/mobile/src
packages/types/src
docs
```

There are also deleted mobile guide/setup files already present in the working tree that were not part of the API integration work. They should be reviewed before committing so unrelated deletions do not accidentally enter the final commit.

## 12. Recommended Next Steps

High priority:

1. Test candidate registration/login on web against the deployed Render API.
2. Test company registration/login on web against the deployed Render API.
3. Create a company account, post a job, then verify it appears in company jobs and public jobs.
4. Create a candidate account, apply to that job, then verify the applicant appears in company candidate review.
5. Rebuild the release APK with the deployed API URL and test the same candidate/company flows on a physical Android device.

Recommended mobile release command:

```sh
cd apps/mobile/android
EXPO_PUBLIC_API_URL=https://skillgap-ai-freelance.onrender.com/api NODE_ENV=production ./gradlew :app:assembleRelease
```

Recommended documentation cleanup:

```txt
docs/PROJECT_STATUS.md
docs/COMMANDS.md
docs/DEPLOYMENT.md
```

Recommended product work:

- Add full company profile schema fields if phone/location/founded year are required.
- Add stronger transactional email delivery and reset-link monitoring for password recovery.
- Add admin review tools for users, companies, jobs, and applications.
- Add end-to-end tests for candidate and company flows.
