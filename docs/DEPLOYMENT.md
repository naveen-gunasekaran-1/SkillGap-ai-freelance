# SkillGap AI — Production Deployment Guide

This document provides a comprehensive guide to deploying the API backend, React web application, and Expo mobile application of the SkillGap-AI platform.

---

## 1. Production Database Setup

SkillGap AI uses PostgreSQL in production. Ensure you have a live PostgreSQL database (e.g., Render Postgres, AWS RDS, or Neon).

1. Copy the connection string.
2. Ensure SSL is enabled/forced by the provider.
3. The database URL will be provided to the API via the `DATABASE_URL` environment variable.

---

## 2. API Backend Deployment (Render)

Deploy the Express API in `apps/api` as a **Web Service** on Render.

### Build and Start Settings

- **Runtime**: Node
- **Build Command**:
  ```sh
  corepack enable && corepack prepare pnpm@9.0.0 --activate && pnpm install --frozen-lockfile --prod=false && pnpm --filter @skillgap/api migrate:deploy && pnpm --filter @skillgap/api build
  ```
- **Start Command**:
  ```sh
  pnpm --filter @skillgap/api start
  ```

### Required Environment Variables

| Variable                                                                  | Production Value / Description                                              |
| :------------------------------------------------------------------------ | :-------------------------------------------------------------------------- |
| `NODE_ENV`                                                                | `production`                                                                |
| `DATABASE_URL`                                                            | Connection string for production PostgreSQL                                 |
| `JWT_ACCESS_SECRET`                                                       | Strong, random string (min 32 chars)                                        |
| `JWT_REFRESH_SECRET`                                                      | Strong, random string (min 32 chars)                                        |
| `JWT_ACCESS_EXPIRES`                                                      | `15m`                                                                       |
| `JWT_REFRESH_EXPIRES`                                                     | `30d`                                                                       |
| `PORT`                                                                    | `3001` (Render configures this automatically)                               |
| `APP_URL`                                                                 | Public HTTPS URL of the deployed web application                            |
| `API_URL`                                                                 | Public HTTPS URL of this deployed API service                               |
| `CORS_ORIGINS`                                                            | Comma-separated allowed web origins (e.g., `https://yourdomain.com`)        |
| `MOBILE_APP_URL`                                                          | `skillgapai://oauth/callback` (used for deep linking)                       |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`                               | Google OAuth credentials                                                    |
| `LINKEDIN_CLIENT_ID` / `LINKEDIN_CLIENT_SECRET`                           | LinkedIn OAuth credentials                                                  |
| `OPENAI_API_KEY`                                                          | _(Optional)_ OpenAI API key for AI gap-report enrichment and resume parsing |
| `OPENAI_MODEL`                                                            | _(Optional)_ `gpt-4o-mini`                                                  |
| `RESEND_API_KEY`                                                          | _(Optional)_ Key for sending transactional verification emails              |
| `EMAIL_FROM`                                                              | `SkillGap AI <no-reply@yourdomain.com>`                                     |
| `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY` | S3/R2 storage for resumes and verification documents                        |
| `S3_PUBLIC_URL`                                                           | Public base URL for uploaded resume links                                   |

### OAuth Callback URLs

Register these exact callback URL patterns in the provider consoles:

- Google: `https://<api-host>/api/auth/oauth/google/callback`
- LinkedIn: `https://<api-host>/api/auth/oauth/linkedin/callback`

For the current Render API host, those are:

- Google: `https://skillgap-ai-freelance.onrender.com/api/auth/oauth/google/callback`
- LinkedIn: `https://skillgap-ai-freelance.onrender.com/api/auth/oauth/linkedin/callback`

---

## 3. Web Frontend Deployment (Vercel / Render Static Sites)

Deploy the React web application in `apps/web` as a static site (SPA).

### Settings (Vercel / Render)

- **Framework Preset**: Vite
- **Root Directory**: repository root
- **Build Command**:
  ```sh
  corepack enable && corepack prepare pnpm@9.0.0 --activate && pnpm install --frozen-lockfile --prod=false && pnpm --filter @skillgap/web build
  ```
- **Output Directory**: `apps/web/dist`

### Rewrite Rules (SPA Redirect)

To prevent `404 Not Found` errors when refreshing routes in a Single Page App (SPA), configure rewrite rules:

- **Vercel**: Handled automatically. If needed, create `vercel.json` in `apps/web`:
  ```json
  {
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
  }
  ```
- **Render Static Sites**: Under **Redirects/Rewrites**, add:
  - **Source**: `/*`
  - **Destination**: `/index.html`
  - **Action**: `Rewrite`

### Environment Variables

| Variable       | Value                                                           |
| :------------- | :-------------------------------------------------------------- |
| `VITE_API_URL` | Public HTTPS URL of your deployed Express API, including `/api` |

For the current Render API service:

```sh
VITE_API_URL=https://skillgap-ai-freelance.onrender.com/api
```

---

## 4. Cloudflare R2 / S3-Compatible Storage Setup

Cloudflare R2 (or AWS S3) is required to securely store verification documents and candidate resumes in production.

1. **Create Bucket**: Create an R2 bucket in Cloudflare (e.g., `skillgap-ai`).
2. **CORS Policy**: Apply a CORS policy on the bucket to allow file downloads from the Web URL:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST"],
       "AllowedOrigins": ["https://yourdomain.com", "http://localhost:5173"],
       "ExposeHeaders": []
     }
   ]
   ```
3. **Configure API Environment Variables**:
   Add the following variables to the Render API Web Service config:
   - `S3_ENDPOINT`: `https://<cloudflare_account_id>.r2.cloudflarestorage.com`
   - `S3_REGION`: `auto`
   - `S3_BUCKET`: `skillgap-ai`
   - `S3_ACCESS_KEY`: `<R2 Access Key ID>`
   - `S3_SECRET_KEY`: `<R2 Secret Access Key>`
   - `S3_PUBLIC_URL`: Optional (for serving public resumes, e.g., `https://pub-xxx.r2.dev`)

---

## 5. Mobile App Production Build (Expo / EAS)

The mobile app in `apps/mobile` uses Expo. To generate production APKs (Android) and IPAs (iOS):

### EAS Build (Recommended)

1. Install EAS CLI:
   ```sh
   npm install -g eas-cli
   ```
2. Log in to Expo:
   ```sh
   eas login
   ```
3. Initialize project inside `apps/mobile`:
   ```sh
   eas project:init
   ```
4. Build Android Release APK:
   ```sh
   EXPO_PUBLIC_API_URL=https://skillgap-ai-freelance.onrender.com/api eas build -p android --profile production
   ```
5. Build iOS App Store Package:
   ```sh
   EXPO_PUBLIC_API_URL=https://skillgap-ai-freelance.onrender.com/api eas build -p ios --profile production
   ```

_Note: The environment variable `EXPO_PUBLIC_API_URL` is baked into the mobile app binary at build time. If the backend URL changes, you must rebuild the app._

### Local Native Release Builds (Alternative)

To build an Android APK locally without EAS:

1. Run prebuild inside `apps/mobile`:
   ```sh
   pnpm --filter @skillgap/mobile prebuild:android
   ```
2. Navigate to directory and build:
   ```sh
   cd apps/mobile/android
   EXPO_PUBLIC_API_URL=https://skillgap-ai-freelance.onrender.com/api NODE_ENV=production ./gradlew :app:assembleRelease
   ```
3. The generated release APK will be saved under:
   `apps/mobile/android/app/build/outputs/apk/release/app-release.apk`

---

## 6. Post-Deployment Setup (Recruiter Trust & Admin)

Recruiter trust is enforced at the database level. When a company registers, they cannot post jobs or review candidates until they are marked as `VERIFIED`.

1. **Recruiter Registration**: Recruiters register their company through the web portal.
2. **Recruiter Verification**: Recruiters go to `/company/verification` and upload business documents.
3. **Promote Admin**: Promote an administrator account to verify companies using the CLI:
   ```sh
   pnpm --filter @skillgap/api admin:promote admin_user@yourdomain.com
   ```
4. **Approve Company**: Log in to the web app using the admin account, access the hidden `/admin` Trust Console tab, inspect the uploaded documents, and click **Approve Company**.
5. Once approved, the company recruiter receives a verification badge and can now access candidate pipelines and post jobs.

---

## 7. Post-Deploy Smoke Checks

After Render deploys the API, verify:

```sh
curl https://skillgap-ai-freelance.onrender.com/health
curl https://skillgap-ai-freelance.onrender.com/ready
```

Expected readiness shape:

```json
{
  "status": "ready",
  "checks": {
    "database": "ok",
    "storageConfigured": true,
    "authSchema": "ok",
    "missingAuthTables": [],
    "missingUserColumns": []
  }
}
```

---

## 8. Demo Data and Clean Database Commands

Populate a local or demo database with mock data:

```sh
pnpm --filter @skillgap/api db:seed
```

This creates demo candidate, company, and admin accounts plus jobs, applications, AI explanations,
company verification records, uploaded-document metadata, fraud flags, audit logs, and admin review
items.

Clear all application data before a clean deployment or demo reset:

```sh
pnpm --filter @skillgap/api db:clear -- --yes
```

Safety guards:

- Without `--yes`, the script refuses to run.
- In `NODE_ENV=production`, the script also requires `--allow-production`.
- Do not run the clear command against a production database unless you intentionally want to wipe it.
