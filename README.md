# SkillGap AI

SkillGap AI is a deployable hiring and career-readiness platform with candidate, company, and admin workflows.

## What Is Included

- Candidate onboarding, login, profile, resume upload/parsing, job search, applications, and AI skill-gap reports.
- Company onboarding, verification, job posting, applicant review, and hiring pipeline screens.
- Admin trust console for company verification, audit logs, fraud flags, and storage health.
- OAuth login support for Google and LinkedIn.
- S3/R2-backed resume and verification document uploads.
- Expo mobile app pointed at the Render API.

## Monorepo Structure

- `apps/api` - Express, Prisma, PostgreSQL API.
- `apps/web` - React + Vite web app.
- `apps/mobile` - Expo mobile app.
- `packages/ui` - shared component library.
- `packages/types` - shared TypeScript types.
- `packages/utils` - shared utilities.
- `docs` - deployment, architecture, and production-readiness notes.

## Local Setup

```sh
corepack enable
corepack prepare pnpm@9.0.0 --activate
pnpm install
pnpm --filter @skillgap/api migrate:deploy
pnpm dev
```

## Verification

```sh
pnpm exec turbo typecheck --force
pnpm exec turbo lint --force
pnpm exec turbo test --force
pnpm exec turbo build --force
```

## Demo Data

Populate the local database with mock candidates, companies, jobs, applications, AI explanations,
verification records, audit logs, and admin review data:

```sh
pnpm --filter @skillgap/api db:seed
```

Clear all application data before a clean deployment or demo reset:

```sh
pnpm --filter @skillgap/api db:clear -- --yes
```

The clear script refuses to run without `--yes`. In `NODE_ENV=production`, it also requires
`--allow-production`.

## Deployment

Use the deployment guide in `docs/DEPLOYMENT.md`.

Current Render API base:

```txt
https://skillgap-ai-freelance.onrender.com/api
```
