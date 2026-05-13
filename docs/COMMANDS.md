# SkillGap AI Commands

Run commands from the project root unless a section says otherwise:

```sh
cd /Users/naveengunasekaran/Desktop/PROJECTs/SkillGap-AI
```

## Install

```sh
pnpm install
```

If `esbuild` postinstall fails because multiple versions run at the same time:

```sh
pnpm install --no-frozen-lockfile --child-concurrency=1
```

## Root Monorepo

```sh
pnpm dev
pnpm build
pnpm typecheck
pnpm lint
pnpm test
pnpm format
pnpm format:check
pnpm clean
```

## API

Start the API:

```sh
pnpm --filter @skillgap/api dev
```

The API normally runs at:

```text
http://localhost:3001
```

Health check:

```sh
curl http://localhost:3001/health
```

Health check using this PC's current LAN IP:

```sh
curl http://10.178.13.4:3001/health
```

Build and typecheck:

```sh
pnpm --filter @skillgap/api build
pnpm --filter @skillgap/api typecheck
```

Run compiled API:

```sh
pnpm --filter @skillgap/api start
```

## Prisma / Database

Generate Prisma client:

```sh
pnpm --filter @skillgap/api exec prisma generate
```

Check migration status:

```sh
pnpm --filter @skillgap/api exec prisma migrate status
```

Create and apply a development migration:

```sh
pnpm --filter @skillgap/api exec prisma migrate dev --name migration_name
```

Apply migrations in deployment:

```sh
pnpm --filter @skillgap/api migrate:deploy
```

Seed database:

```sh
pnpm --filter @skillgap/api db:seed
```

Reset local database:

```sh
pnpm --filter @skillgap/api db:reset
```

Inspect local SQLite tables:

```sh
sqlite3 apps/api/prisma/dev.db '.tables'
sqlite3 apps/api/prisma/dev.db '.schema User'
```

## Web App

Start web dev server:

```sh
pnpm --filter @skillgap/web dev
```

Build and preview:

```sh
pnpm --filter @skillgap/web build
pnpm --filter @skillgap/web preview
```

Typecheck:

```sh
pnpm --filter @skillgap/web typecheck
```

## Mobile App

Start Expo:

```sh
pnpm --filter @skillgap/mobile dev
```

Start Expo on a specific port:

```sh
pnpm --filter @skillgap/mobile exec expo start --port 8084
```

Start Expo for a physical device on the same Wi-Fi as this PC:

```sh
EXPO_PUBLIC_API_URL=http://10.178.13.4:3001/api pnpm --filter @skillgap/mobile exec expo start --lan --port 8084
```

Typecheck:

```sh
pnpm --filter @skillgap/mobile typecheck
```

Run Android through Expo:

```sh
pnpm --filter @skillgap/mobile android
```

Run iOS through Expo:

```sh
pnpm --filter @skillgap/mobile ios
```

Run mobile web:

```sh
pnpm --filter @skillgap/mobile web
```

Prebuild native projects:

```sh
pnpm --filter @skillgap/mobile prebuild
pnpm --filter @skillgap/mobile prebuild:android
pnpm --filter @skillgap/mobile prebuild:ios
```

## Physical Device Setup

Find this PC's Wi-Fi IP address on macOS:

```sh
ipconfig getifaddr en0
```

If `en0` does not return an IP:

```sh
ipconfig getifaddr en1
```

Use that IP in `EXPO_PUBLIC_API_URL`.

Example:

```sh
EXPO_PUBLIC_API_URL=http://10.178.13.4:3001/api pnpm --filter @skillgap/mobile exec expo start --lan --port 8084
```

The phone and PC must be on the same Wi-Fi. The API must be running on the PC:

```sh
pnpm --filter @skillgap/api dev
```

Then verify from the PC:

```sh
curl http://10.178.13.4:3001/health
```

## APK Build

Build a local debug APK from the native Android project:

```sh
cd apps/mobile/android
EXPO_PUBLIC_API_URL=http://10.178.13.4:3001/api ./gradlew assembleDebug
```

APK output:

```text
apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk
```

Check APK file:

```sh
ls -lh apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk
shasum -a 256 apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk
```

Install APK on a connected Android device with ADB:

```sh
adb install -r apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk
```

Build Android with EAS:

```sh
EXPO_PUBLIC_API_URL=http://10.178.13.4:3001/api pnpm --filter @skillgap/mobile build:android
```

For a real public APK, use a deployed API URL instead of the local Wi-Fi IP:

```sh
EXPO_PUBLIC_API_URL=https://your-api-domain.com/api pnpm --filter @skillgap/mobile build:android
```

## Ports And Process Checks

Check API port:

```sh
lsof -nP -iTCP:3001 -sTCP:LISTEN
```

Check Expo port:

```sh
lsof -nP -iTCP:8084 -sTCP:LISTEN
```

Stop a process by PID:

```sh
kill PID
```

## Watchman Fix

If Expo shows repeated Watchman recrawl warnings:

```sh
watchman watch-del '/Users/naveengunasekaran/Desktop/PROJECTs/SkillGap-AI'
watchman watch-project '/Users/naveengunasekaran/Desktop/PROJECTs/SkillGap-AI'
```

## Docker Services

Start Postgres and Redis from `docker-compose.yml`:

```sh
docker compose up -d
```

Stop services:

```sh
docker compose down
```

View running services:

```sh
docker compose ps
```

## Useful Git Commands

Check changed files:

```sh
git status --short
```

View changes:

```sh
git diff
```

View changes for one file:

```sh
git diff -- path/to/file
```

## Common Working Flows

Run API and mobile for a physical phone:

```sh
pnpm --filter @skillgap/api dev
EXPO_PUBLIC_API_URL=http://10.178.13.4:3001/api pnpm --filter @skillgap/mobile exec expo start --lan --port 8084
```

Build APK for same-Wi-Fi testing:

```sh
cd apps/mobile/android
EXPO_PUBLIC_API_URL=http://10.178.13.4:3001/api ./gradlew assembleDebug
```

Run all TypeScript checks:

```sh
pnpm typecheck
```

Run only API and mobile checks:

```sh
pnpm --filter @skillgap/api typecheck
pnpm --filter @skillgap/mobile typecheck
```
