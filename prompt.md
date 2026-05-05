# SkillGap AI — Master Copilot Prompt
### Final Year Project | Complete End-to-End Build Guide
---

> **How to use this prompt:**
> Paste the entire contents of each Phase block into Copilot Chat (or your IDE agent).
> Complete one phase fully before starting the next.
> Each phase ends with a checkpoint — do not skip them.

---

---

# ═══════════════════════════════════════
# MASTER CONTEXT BLOCK
# (Paste this at the start of EVERY phase prompt)
# ═══════════════════════════════════════

```
You are a senior full-stack engineer helping me build "SkillGap AI" —
my final year university project. This is a cross-platform job-skill
intelligence platform that solves three problems with existing job boards
(LinkedIn, Naukri, Indeed):

1. Fake/unverified job postings
2. Zero candidate communication (no rejection emails, no feedback)
3. ATS black-box — students don't know WHY they were rejected

PRODUCT VISION:
SkillGap AI analyzes a candidate's skills vs a job description, identifies
gaps, explains WHY they didn't match, and recommends a precise learning path
to close those gaps. Companies are required by the platform to send rejection
reasons — it is enforced at the API level, not just a UI nudge.

TECH STACK (do not deviate from this):
- Frontend Web:      React 18 + TypeScript + Vite
- Mobile:            React Native (Expo) — iOS + Android from one codebase
- State Management:  Zustand (lightweight, no Redux boilerplate)
- Styling Web:       Tailwind CSS v3 + shadcn/ui component library
- Styling Mobile:    NativeWind (Tailwind for React Native)
- Backend:           Node.js + Express (TypeScript) — monorepo structure
- Database:          PostgreSQL (primary) + Redis (caching/sessions)
- ORM:               Prisma
- AI/NLP:            OpenAI API (GPT-4o) for JD parsing + gap analysis
- Auth:              JWT + refresh tokens + OAuth2 (Google, LinkedIn, GitHub)
- Email:             Nodemailer + SendGrid
- File Storage:      AWS S3 (resume uploads)
- Deployment Web:    Vercel (frontend) + Railway or Render (backend)
- Deployment Mobile: Expo EAS Build → App Store + Play Store
- Monorepo Tool:     Turborepo
- Testing:           Vitest (unit) + Playwright (E2E web) + Detox (mobile E2E)
- CI/CD:             GitHub Actions
- Docs:              Swagger/OpenAPI (API) + Storybook (components)

DESIGN SYSTEM (strictly follow these values — never override them):
Colors:
  --primary:        #2563EB
  --primary-dark:   #1E40AF
  --primary-light:  #DBEAFE
  --ai-purple:      #7C3AED
  --ai-cyan:        #06B6D4
  --background:     #F9FAFB
  --surface:        #FFFFFF
  --border:         #E5E7EB
  --text-primary:   #111827
  --text-secondary: #6B7280
  --success:        #10B981
  --warning:        #F59E0B
  --error:          #EF4444

Typography:
  Font: Inter (web), Inter_400Regular + Inter_600SemiBold + Poppins_700Bold (mobile)
  H1: 32px/700, H2: 24px/600, H3: 20px/500
  Body: 16px/400, Caption: 14px, Small: 12px
  Line height: 1.5

Design Rules:
  - Card border-radius: 12px
  - Spacing grid: 8px base unit (8, 16, 24, 32, 48, 64)
  - Shadows: soft (0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.06))
  - AI gradient: linear-gradient(135deg, #7C3AED, #06B6D4) — use only for
    AI-generated content badges, highlights, CTA buttons for AI features
  - Hover: translateY(-2px) + shadow increase (100ms ease)
  - Transitions: all 150ms ease for colors, 200ms for transforms

PROJECT STRUCTURE (monorepo):
skillgap-ai/
├── apps/
│   ├── web/          (React + Vite)
│   ├── mobile/       (Expo React Native)
│   └── api/          (Node + Express)
├── packages/
│   ├── ui/           (shared design system components)
│   ├── types/        (shared TypeScript interfaces)
│   ├── utils/        (shared utility functions)
│   └── config/       (shared ESLint, Tailwind, TS configs)
├── docs/
├── .github/workflows/
├── turbo.json
└── package.json

IMPORTANT RULES FOR ALL CODE:
1. TypeScript strict mode — no `any` types, no type assertions without comments
2. Every component must have JSDoc comments
3. Every API endpoint must have OpenAPI annotations
4. Accessibility: WCAG 2.1 AA minimum — aria labels, keyboard navigation
5. Mobile: all touch targets minimum 44x44px
6. Error boundaries on every major route
7. Loading skeletons (not spinners) for all async data
8. Every form must have proper validation with react-hook-form + zod
9. All API calls through a centralized axios instance with interceptors
10. Environment variables — never hardcode secrets, always use .env + validation
```

---

---

# ═══════════════════════════════════════
# PHASE 1 — PROJECT SCAFFOLD & ARCHITECTURE
# Estimated time: 1–2 days
# ═══════════════════════════════════════

```
[PASTE MASTER CONTEXT BLOCK ABOVE THIS LINE FIRST]

PHASE 1 TASK: Project scaffold, monorepo setup, design system foundation.

Do the following steps IN ORDER. After each step, confirm it works before
moving to the next.

────────────────────────────────────────
STEP 1.1 — Monorepo Bootstrap
────────────────────────────────────────
Create the Turborepo monorepo with this exact structure:

1. Init: `npx create-turbo@latest skillgap-ai`
2. Configure turbo.json with pipelines: build, dev, test, lint
3. Root package.json with workspaces for apps/* and packages/*
4. Node version: 20 LTS (add .nvmrc)
5. Package manager: pnpm (add pnpm-workspace.yaml)

────────────────────────────────────────
STEP 1.2 — Shared Packages Setup
────────────────────────────────────────
Create packages/types/src/index.ts with these TypeScript interfaces:

```typescript
// User & Auth
interface User {
  id: string;
  email: string;
  name: string;
  role: 'CANDIDATE' | 'COMPANY' | 'ADMIN';
  avatar?: string;
  createdAt: Date;
}

// Job
interface Job {
  id: string;
  title: string;
  company: Company;
  description: string;
  requirements: string[];
  skillsRequired: Skill[];
  location: string;
  type: 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'CONTRACT';
  isVerified: boolean;
  salaryMin?: number;
  salaryMax?: number;
  postedAt: Date;
  expiresAt?: Date;
}

// Skill
interface Skill {
  id: string;
  name: string;
  category: string;
  aliases: string[];
  marketDemandScore: number; // 0-100
}

// Application
interface Application {
  id: string;
  candidateId: string;
  jobId: string;
  status: ApplicationStatus;
  matchScore: number; // 0-100
  gapReport?: GapReport;
  rejectionReason?: string;
  appliedAt: Date;
  updatedAt: Date;
}

type ApplicationStatus =
  | 'APPLIED'
  | 'UNDER_REVIEW'
  | 'SHORTLISTED'
  | 'INTERVIEW_SCHEDULED'
  | 'INTERVIEW_DONE'
  | 'OFFER_EXTENDED'
  | 'HIRED'
  | 'REJECTED';

// Gap Report (AI generated)
interface GapReport {
  id: string;
  applicationId: string;
  overallMatchPercent: number;
  criticalGaps: SkillGap[];
  partialMatches: SkillGap[];
  strengths: string[];
  recommendations: LearningRecommendation[];
  generatedAt: Date;
}

interface SkillGap {
  skillName: string;
  required: string; // what JD expects
  candidate: string; // what candidate has
  severity: 'CRITICAL' | 'MODERATE' | 'MINOR';
  explanation: string;
}

interface LearningRecommendation {
  skillName: string;
  resourceTitle: string;
  platform: string;
  url: string;
  estimatedHours: number;
  isFree: boolean;
  priority: number;
}

// Company
interface Company {
  id: string;
  name: string;
  logo?: string;
  isVerified: boolean;
  verificationBadge?: 'GSTIN' | 'MCA' | 'MANUAL';
  industry: string;
  size: string;
  website?: string;
}
```

────────────────────────────────────────
STEP 1.3 — Shared Config Packages
────────────────────────────────────────
Create:
- packages/config/tailwind.config.js — extend with all SkillGap design tokens
- packages/config/tsconfig.base.json — strict TypeScript config
- packages/config/.eslintrc.js — ESLint + TypeScript + React rules
- packages/config/prettier.config.js

The Tailwind config must include:
```javascript
theme: {
  extend: {
    colors: {
      primary: { DEFAULT: '#2563EB', dark: '#1E40AF', light: '#DBEAFE' },
      ai: { purple: '#7C3AED', cyan: '#06B6D4' },
      surface: '#FFFFFF',
      border: '#E5E7EB',
    },
    borderRadius: { card: '12px' },
    fontFamily: { sans: ['Inter', 'sans-serif'], display: ['Poppins', 'sans-serif'] },
    boxShadow: {
      card: '0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.06)',
      'card-hover': '0 4px 16px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.08)',
    },
  }
}
```

────────────────────────────────────────
STEP 1.4 — Shared UI Component Library (packages/ui)
────────────────────────────────────────
Set up packages/ui with:
1. Storybook 7 configured
2. Build these base components (web-first, using Tailwind):

Button.tsx — variants: primary, secondary, ghost, danger, ai-gradient
  - ai-gradient uses: bg-gradient-to-r from-ai-purple to-ai-cyan
  - All variants have hover lift animation
  - Loading state with spinner
  - Disabled state
  - Sizes: sm, md, lg

Card.tsx — surface white, shadow-card, rounded-card, hover option

Badge.tsx — variants: success, warning, error, info, ai, neutral

ProgressBar.tsx — animated fill, label, percentage display

SkillTag.tsx — pill shape, color by severity (critical=red, partial=yellow, match=green)

MatchScore.tsx — circular progress ring + percentage number, color changes by score:
  < 40% = error, 40-70% = warning, > 70% = success

Avatar.tsx — image with fallback initials, sizes: sm/md/lg

Skeleton.tsx — animated shimmer loading placeholder, shapes: text/card/avatar/bar

Input.tsx — with label, error state, helper text, icon support
Textarea.tsx
Select.tsx

All components must:
- Export proper TypeScript props interfaces
- Have Storybook stories
- Be accessible (proper ARIA, keyboard nav)

────────────────────────────────────────
STEP 1.5 — Web App Bootstrap (apps/web)
────────────────────────────────────────
1. Vite + React 18 + TypeScript
2. Install: tailwindcss, react-router-dom v6, zustand, axios,
   react-hook-form, zod, @hookform/resolvers, react-query (TanStack Query v5),
   lucide-react, framer-motion, recharts, react-hot-toast
3. Routing structure:
   /                     → Landing page
   /login                → Auth page
   /register             → Auth page
   /dashboard            → Candidate home (protected)
   /jobs                 → Job discovery
   /jobs/:id             → Job detail
   /applications         → My applications tracker
   /applications/:id     → Application detail + gap report
   /profile              → Candidate profile & skills
   /company/*            → Company portal (role-gated)
   /admin/*              → Admin panel (role-gated)

4. Set up axios instance at src/lib/api.ts with:
   - Base URL from env
   - JWT header injection
   - Refresh token interceptor
   - Global error toast on 5xx

5. Set up Zustand stores:
   - authStore (user, token, login, logout)
   - jobStore (jobs, filters, pagination)
   - applicationStore (applications, status updates)

────────────────────────────────────────
STEP 1.6 — Mobile App Bootstrap (apps/mobile)
────────────────────────────────────────
1. `npx create-expo-app mobile --template expo-template-blank-typescript`
2. Install: nativewind, expo-router v3, zustand, axios,
   react-hook-form, zod, expo-secure-store, expo-image-picker,
   react-native-reanimated, react-native-gesture-handler
3. Configure expo-router with same route structure as web (mirrored)
4. Configure NativeWind with the same design tokens
5. App entry: app/_layout.tsx with auth guard

────────────────────────────────────────
STEP 1.7 — Backend Bootstrap (apps/api)
────────────────────────────────────────
1. Express + TypeScript + ts-node-dev
2. Install: prisma, @prisma/client, jsonwebtoken, bcryptjs,
   express-validator, cors, helmet, morgan, express-rate-limit,
   multer, aws-sdk, nodemailer, openai, redis, ioredis,
   swagger-jsdoc, swagger-ui-express
3. Folder structure:
   src/
   ├── routes/         (auth, jobs, applications, users, companies, ai)
   ├── controllers/    (business logic)
   ├── middleware/     (auth, validation, rate-limit, error)
   ├── services/       (ai, email, storage, verification)
   ├── prisma/         (schema + migrations)
   ├── lib/            (db, redis, openai clients)
   └── types/          (express extensions, env)

4. Global error handler middleware
5. Request logging with Morgan
6. Security: helmet, cors with whitelist, rate limiting

────────────────────────────────────────
STEP 1.8 — Database Schema (Prisma)
────────────────────────────────────────
Create prisma/schema.prisma with these models:

User, CandidateProfile, Company, Job, Skill, JobSkill,
Application, GapReport, SkillGap, LearningRecommendation,
Notification, AuditLog

Key constraints to enforce in the schema:
- Application status transitions must be logged in AuditLog
- Company must have isVerified before posting jobs (enforced at API level)
- GapReport is required before Application can move to REJECTED
  (nullable in DB but validated in service layer)
- Add indexes on: userId, jobId, status, createdAt, companyId

────────────────────────────────────────
PHASE 1 CHECKPOINT — before proceeding:
────────────────────────────────────────
Verify all of the following work:
[ ] pnpm dev starts all three apps simultaneously via Turborepo
[ ] TypeScript compiles with zero errors across all packages
[ ] Storybook loads and shows all components
[ ] Prisma generates client successfully
[ ] API server starts on port 3001
[ ] Web app loads on port 5173
[ ] Mobile app loads in Expo Go
[ ] All ESLint rules pass (pnpm lint)
```

---

---

# ═══════════════════════════════════════
# PHASE 2 — AUTHENTICATION & USER SYSTEM
# Estimated time: 2–3 days
# ═══════════════════════════════════════

```
[PASTE MASTER CONTEXT BLOCK ABOVE THIS LINE FIRST]

PHASE 2 TASK: Complete auth system — registration, login, OAuth, JWT refresh,
role-based access, profile setup. This must be rock-solid before anything else.

────────────────────────────────────────
STEP 2.1 — Backend Auth Routes & Controllers
────────────────────────────────────────
Build src/routes/auth.ts with these endpoints, fully documented with OpenAPI:

POST /auth/register
  - Body: { email, password, name, role: 'CANDIDATE' | 'COMPANY' }
  - Validate: email format, password min 8 chars + 1 uppercase + 1 number
  - Hash password with bcrypt (rounds: 12)
  - Create User + CandidateProfile OR Company record depending on role
  - Send welcome email (async, don't block response)
  - Return: { user, accessToken, refreshToken }

POST /auth/login
  - Rate limited: 5 attempts per 15 minutes per IP
  - Return: { user, accessToken, refreshToken }
  - refreshToken stored as httpOnly cookie

POST /auth/refresh
  - Validate refresh token from cookie
  - Return new accessToken (15min expiry) + rotate refreshToken (7 days)

POST /auth/logout
  - Blacklist refresh token in Redis
  - Clear cookie

POST /auth/forgot-password
  - Generate 6-digit OTP, store in Redis with 15min TTL
  - Send OTP email

POST /auth/reset-password
  - Validate OTP, update password

GET /auth/google — OAuth2 redirect
GET /auth/google/callback
GET /auth/linkedin/callback
GET /auth/github/callback

────────────────────────────────────────
STEP 2.2 — Auth Middleware
────────────────────────────────────────
Create src/middleware/auth.ts:
- requireAuth — verify JWT, attach user to req.user
- requireRole(roles: Role[]) — check req.user.role
- optionalAuth — attach user if token present, don't block if absent

────────────────────────────────────────
STEP 2.3 — Web Auth UI
────────────────────────────────────────
Build these pages using the design system:

src/pages/auth/LoginPage.tsx:
- Email + password form with react-hook-form + zod
- "Login with Google" button (AI-gradient outlined style)
- "Login with LinkedIn" button
- Show/hide password toggle
- Remember me checkbox
- Error states inline under fields (not toasts)
- Redirect to /dashboard on success
- Smooth fade-in animation with framer-motion

src/pages/auth/RegisterPage.tsx:
- Step 1: Role selection card UI (Candidate vs Company) — large card buttons,
  clicking one highlights it with primary border and animates to step 2
- Step 2: Name, email, password fields
- Step 3 (Candidate): Skills onboarding — searchable skill tags selector
  (fetch from /api/skills), pick up to 20 skills, tag UI
- Step 3 (Company): Company name, industry, size, website, upload logo
- Progress indicator at top showing steps 1/2/3
- Each step validated before advancing

────────────────────────────────────────
STEP 2.4 — Mobile Auth UI
────────────────────────────────────────
Mirror the web auth screens in apps/mobile/app/(auth)/:
- login.tsx, register.tsx (same UX, native components)
- Use Expo SecureStore for token storage (NEVER AsyncStorage for auth tokens)
- Biometric login option (expo-local-authentication) for returning users
- Keyboard-aware scroll (KeyboardAvoidingView)

────────────────────────────────────────
STEP 2.5 — Protected Routes & Auth State
────────────────────────────────────────
Web: Create src/components/auth/ProtectedRoute.tsx
- Check authStore for valid token
- Redirect to /login with `?redirect=` param if not authed
- Show skeleton while checking auth state (not blank screen, not spinner)

Mobile: In app/_layout.tsx, use expo-router's redirect
  based on authStore state

────────────────────────────────────────
PHASE 2 CHECKPOINT:
────────────────────────────────────────
[ ] Register as CANDIDATE works end-to-end (web + mobile)
[ ] Register as COMPANY works end-to-end
[ ] Login works, JWT stored correctly
[ ] Refresh token rotates silently in background
[ ] Logout clears all tokens
[ ] Protected routes redirect to login
[ ] Role-based access: company user cannot access /profile (candidate only)
[ ] OAuth Google flow completes (test with real account)
[ ] OTP password reset flow works
[ ] All Zod validation schemas tested
```

---

---

# ═══════════════════════════════════════
# PHASE 3 — JOB SYSTEM & VERIFICATION
# Estimated time: 2–3 days
# ═══════════════════════════════════════

```
[PASTE MASTER CONTEXT BLOCK ABOVE THIS LINE FIRST]

PHASE 3 TASK: Job posting, discovery, search, filtering, and the
verification system that prevents fake posts.

────────────────────────────────────────
STEP 3.1 — Job API Endpoints
────────────────────────────────────────
Build src/routes/jobs.ts:

GET /jobs
  Query params: search, location, type, skills (array), minSalary,
                maxSalary, isVerified, page, limit, sortBy
  - Full-text search on title + description (PostgreSQL tsvector)
  - Paginated response with total count
  - Response includes company verification badge

GET /jobs/:id
  - Full job details + company info + required skills
  - If authenticated, include matchScore for current user

POST /jobs (Company role only, company must be verified)
  - Body: title, description, requirements[], skillsRequired[], location,
    type, salaryMin, salaryMax, expiresAt
  - AI-powered JD quality check (flag vague requirements)
  - Auto-extract skills from description using NLP

PUT /jobs/:id (Company owner only)
DELETE /jobs/:id (Company owner only — soft delete)

POST /jobs/:id/report (Authenticated users)
  - Report fraudulent/fake job
  - Body: { reason: string }
  - Auto-flag job if 3+ reports

────────────────────────────────────────
STEP 3.2 — Company Verification System
────────────────────────────────────────
Create src/services/verification.service.ts:

Method: verifyCompanyGSTIN(gstin: string)
  - Validate GSTIN format (regex)
  - Call GST verification API (or mock with realistic fake API for dev)
  - If valid: set company.isVerified = true, verificationBadge = 'GSTIN'

Method: verifyCompanyManual(companyId, documents[])
  - Upload documents to S3
  - Flag for admin review
  - Admin endpoint to approve/reject

POST /companies/verify/gstin
POST /companies/verify/documents
GET  /companies/:id (public profile)

Companies with isVerified=false CAN register but CANNOT post jobs.
API middleware should enforce this.

────────────────────────────────────────
STEP 3.3 — AI Skill Extraction Service
────────────────────────────────────────
Create src/services/ai.service.ts:

Method: extractSkillsFromJD(jobDescription: string): Promise<Skill[]>
  - OpenAI prompt: "Extract all technical and soft skills from this
    job description. Return JSON array: [{name, category, required: boolean}]"
  - Map returned skill names against Skill table (fuzzy match)
  - Create new Skill records for unrecognized skills
  - Cache result in Redis for 24 hours (key: hash of JD)

Method: generateGapReport(resumeText: string, jobDescription: string, 
                           candidateSkills: Skill[]): Promise<GapReport>
  - Structured prompt with all candidate data + JD
  - Return structured JSON matching GapReport interface
  - Parse and validate response with Zod before saving

────────────────────────────────────────
STEP 3.4 — Job Discovery UI (Web)
────────────────────────────────────────
Build src/pages/jobs/JobsPage.tsx:

Layout: 3-column on desktop, 1-column on mobile
- Left sidebar (desktop): filters panel
  - Search input (debounced 300ms)
  - Job type checkboxes (Full Time, Part Time, Internship, Contract)
  - Location input with autocomplete
  - Salary range dual-handle slider
  - Skills filter with tag selector
  - "Verified Only" toggle (premium blue pill)
  - Clear all filters button
  
- Center: Job cards list (infinite scroll with IntersectionObserver)

JobCard component:
  - Company logo (Avatar fallback)
  - Verified badge if isVerified (blue checkmark + "Verified" text)
  - Job title (H3), company name, location, type badge
  - Posted X days ago
  - Salary range if provided
  - Skill tags (first 4 visible, "+N more" overflow)
  - Match score ring (only if logged in) — top right corner
  - Hover: card lifts (translateY -2px), shadow increases
  - Skeleton loading: show 6 skeleton cards while fetching

- Right sidebar (desktop): Featured companies panel

────────────────────────────────────────
STEP 3.5 — Job Detail Page (Web)
────────────────────────────────────────
src/pages/jobs/JobDetailPage.tsx:

Top section:
  - Company logo + name + verified badge
  - Job title (H1)
  - Meta row: location, type, salary, posted date
  - Two CTAs: "Apply Now" (primary button) + "Save Job" (ghost button)
  - Match score card (if logged in): large circular ring + "You match X%"
    + "See what's missing" link → scrolls to gap analysis section

Tabs: Overview | Requirements | Company | Gap Analysis (if logged in)

Gap Analysis tab:
  - Show GapReport if already generated for this user
  - "Analyze My Profile" button if not yet generated
    → triggers POST /applications/:id/analyze (calls AI service)
  - Loading state: animated AI gradient progress bar with message
    "Analyzing your profile against this job description..."
  - Show gap report results (same UI as the report screen)

Apply button behavior:
  - Opens a slide-over drawer (not a new page)
  - Drawer: resume upload (if not already in profile), cover note (optional)
  - Confirm & Apply button
  - On success: confetti animation (canvas-confetti library), toast,
    redirect to applications tracker

────────────────────────────────────────
PHASE 3 CHECKPOINT:
────────────────────────────────────────
[ ] Job listing API with all filters works
[ ] Full-text search returns relevant results
[ ] Unverified company cannot post jobs
[ ] GSTIN verification mock works
[ ] AI skill extraction from JD produces valid JSON
[ ] Job cards render correctly with match scores for logged-in users
[ ] Infinite scroll works on mobile and web
[ ] Skeleton loading shows correctly before data arrives
[ ] Job detail page all tabs render
[ ] Apply drawer opens and submits correctly
```

---

---

# ═══════════════════════════════════════
# PHASE 4 — APPLICATION TRACKING & GAP REPORTS
# Estimated time: 3–4 days (this is your core differentiator)
# ═══════════════════════════════════════

```
[PASTE MASTER CONTEXT BLOCK ABOVE THIS LINE FIRST]

PHASE 4 TASK: The application lifecycle state machine, gap report engine,
and the MANDATORY rejection reason system. This is the #1 differentiator.

────────────────────────────────────────
STEP 4.1 — Application State Machine (Backend)
────────────────────────────────────────
Create src/services/application.service.ts:

RULE: This is a state machine. Implement it as such:

const VALID_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  APPLIED:               ['UNDER_REVIEW', 'REJECTED'],
  UNDER_REVIEW:          ['SHORTLISTED', 'REJECTED'],
  SHORTLISTED:           ['INTERVIEW_SCHEDULED', 'REJECTED'],
  INTERVIEW_SCHEDULED:   ['INTERVIEW_DONE', 'REJECTED'],
  INTERVIEW_DONE:        ['OFFER_EXTENDED', 'REJECTED'],
  OFFER_EXTENDED:        ['HIRED', 'REJECTED'],
  HIRED:                 [],
  REJECTED:              [],
};

Method: transitionStatus(applicationId, newStatus, actorId, metadata)
  1. Validate the transition is allowed
  2. If transitioning TO REJECTED:
     - REQUIRE rejectionReason (throw 400 if missing)
     - REQUIRE gapReport to have been generated (if not, generate it now)
     - Trigger: sendRejectionEmail(candidate, job, rejectionReason, gapReport)
  3. Log the transition in AuditLog
  4. Save new status
  5. Trigger appropriate notification

SLA enforcement (run as cron job every hour):
  - Find all applications in APPLIED status for > 30 days
  - Auto-transition to REJECTED with reason = "No response from company"
  - Send automated rejection + gap report to candidate
  - Deduct 1 "response score" point from company (displayed on their profile)
  - Log as auto-rejection in AuditLog

────────────────────────────────────────
STEP 4.2 — Application API Endpoints
────────────────────────────────────────
POST /applications
  - Creates application
  - Immediately triggers AI gap analysis in background (bull queue or setImmediate)
  - Returns application with matchScore

GET /applications (candidate's own)
  - Include job + company + current status + matchScore
  - Sortable by date, match score, status

GET /applications/:id
  - Full details including GapReport

PATCH /applications/:id/status (Company only, job owner)
  - Body: { status, rejectionReason?, interviewDate? }
  - Validates state machine transition
  - rejectionReason REQUIRED when status = REJECTED

GET /applications/job/:jobId (Company only)
  - All applications for a specific job
  - Include candidate profiles + match scores
  - Sortable by matchScore

POST /applications/:id/analyze
  - Generate/regenerate gap report
  - Calls AI service
  - Returns GapReport

────────────────────────────────────────
STEP 4.3 — Gap Report AI Prompt Engineering
────────────────────────────────────────
This is critical — the prompt must produce structured, student-friendly output.

In src/services/ai.service.ts, the generateGapReport prompt must be:

System: "You are an expert career advisor and technical recruiter. You will
analyze a candidate's profile against a job description and produce a
structured gap analysis. Be specific, honest, and constructive. Your output
will be shown directly to the candidate to help them improve."

User: `
Job Title: {title}
Company: {company}

JOB DESCRIPTION:
{fullJD}

REQUIRED SKILLS (from JD):
{requiredSkills}

CANDIDATE SKILLS:
{candidateSkills}

CANDIDATE EXPERIENCE:
{experience}

CANDIDATE EDUCATION:
{education}

Analyze and return ONLY valid JSON matching this schema exactly:
{
  "overallMatchPercent": number (0-100),
  "summary": string (2-3 sentences, kind but honest),
  "criticalGaps": [
    {
      "skillName": string,
      "required": string (what the JD expects),
      "candidate": string (what they have or "Not found in profile"),
      "severity": "CRITICAL" | "MODERATE" | "MINOR",
      "explanation": string (1 sentence, WHY this matters for this role)
    }
  ],
  "strengths": [string] (what they DO have that matches),
  "recommendations": [
    {
      "skillName": string,
      "resourceTitle": string,
      "platform": "Coursera" | "Udemy" | "YouTube" | "freeCodeCamp" | "docs",
      "estimatedHours": number,
      "isFree": boolean,
      "priority": number (1 = most important)
    }
  ],
  "encouragement": string (one sentence to motivate the candidate)
}
`

Validate the JSON response with Zod before storing.
If validation fails, retry once with a stricter prompt.

────────────────────────────────────────
STEP 4.4 — Application Tracker UI (Web)
────────────────────────────────────────
Build src/pages/applications/ApplicationsPage.tsx:

Header:
  - Stats row: Total Applied, Interviews, Offers, Rejection Rate
    (metric cards, animated count-up on first render)

Two views (toggle): Kanban Board | List View

Kanban Board:
  - Columns matching ApplicationStatus enum
  - Cards are draggable (react-beautiful-dnd or @dnd-kit/core)
  - Company can drag cards to change status (triggers PATCH endpoint)
  - Candidate view: columns are read-only, show match score on card

List View:
  - Table: Company logo, Job title, Applied date, Status badge, Match %, Actions
  - Status badge: color-coded (REJECTED=red, HIRED=green, etc.)
  - "View Report" CTA for each row → opens GapReport drawer

────────────────────────────────────────
STEP 4.5 — Gap Report UI (the most important screen)
────────────────────────────────────────
Build src/pages/applications/GapReportPage.tsx:

This screen must be beautiful and clear. This is what makes SkillGap AI different.

Top section:
  - Job title + Company name + Applied date
  - Large match score ring (120px, animated fill on mount)
  - Status badge
  - AI badge: "Generated by SkillGap AI" with ai-gradient background

Match breakdown (progress bars, animated):
  - Technical Skills: X%
  - Experience: X%  
  - Education: X%
  Each bar animates from 0 to value on mount (framer-motion)

Gap cards grid (3 columns desktop, 1 mobile):
  - CRITICAL gaps: red card header
  - MODERATE gaps: yellow card header
  - MINOR gaps: gray card header
  Each card shows: skill name, what was required vs what you have, explanation

Strengths section:
  - Green checkmark tags for matching skills

Learning Roadmap section:
  - Priority-ordered list
  - Each item: priority number badge, skill name, course title, platform badge,
    hours estimate, free/paid indicator, "Start Learning →" link
  - "This roadmap will close your gaps for this job type" note

Encouragement banner:
  - AI gradient background, white text, the AI's encouragement message
  - Subtle pulse animation

────────────────────────────────────────
PHASE 4 CHECKPOINT:
────────────────────────────────────────
[ ] Application submission creates gap report via AI
[ ] State machine rejects invalid transitions (test each invalid path)
[ ] PATCH to REJECTED without rejectionReason returns 400
[ ] Rejection email is sent with gap report data
[ ] Auto-rejection cron job logic works (test with short timeout in dev)
[ ] Company application dashboard shows all applicants with scores
[ ] Kanban drag-and-drop updates status in real time
[ ] Gap report renders correctly with all sections
[ ] Learning recommendations have real URLs
[ ] Match score ring animation works on mobile
```

---

---

# ═══════════════════════════════════════
# PHASE 5 — CANDIDATE PROFILE & COMPANY PORTAL
# Estimated time: 2 days
# ═══════════════════════════════════════

```
[PASTE MASTER CONTEXT BLOCK ABOVE THIS LINE FIRST]

PHASE 5 TASK: Candidate profile builder and company management portal.

────────────────────────────────────────
STEP 5.1 — Candidate Profile API
────────────────────────────────────────
GET  /users/me/profile
PUT  /users/me/profile
POST /users/me/resume (upload to S3, parse with AI, auto-fill skills)
GET  /users/me/skills
POST /users/me/skills (add skill + proficiency level)
DELETE /users/me/skills/:skillId

Resume parsing (AI service):
  - Accept PDF upload (max 5MB)
  - Extract text (pdf-parse library)
  - Send to OpenAI: extract skills, experience, education
  - Auto-populate CandidateProfile
  - Show a diff UI: "We found these — confirm what to add"

────────────────────────────────────────
STEP 5.2 — Candidate Profile UI (Web)
────────────────────────────────────────
src/pages/profile/ProfilePage.tsx:

Layout: Two columns (desktop)
Left: Profile card (avatar, name, headline, location, links)
Right: Sections (scrollable)

Sections:
  About (bio textarea, auto-save on blur)
  
  Skills (the most important section):
    - Skill tags with proficiency dots (1-5)
    - Add skill: searchable dropdown (calls /skills search)
    - Drag to reorder
    - Remove button
    - "Profile completeness" bar at top (% of recommended sections filled)
  
  Experience (add/edit/delete cards)
  Education (add/edit/delete cards)
  
  Resume:
    - Upload zone (drag-and-drop or click)
    - Upload animation (progress bar)
    - After upload: "AI Parsed your resume!" banner
    - Show parsed skills + experience with confirm checkboxes
    - "Add all" button
  
  GitHub/LinkedIn imports:
    - "Connect GitHub" button → OAuth → import repos as projects
    - "Sync LinkedIn" → import experience

────────────────────────────────────────
STEP 5.3 — Company Portal
────────────────────────────────────────
src/pages/company/ — role-gated to COMPANY users

CompanyDashboard.tsx:
  - Stats: Active Jobs, Total Applications, Avg Response Rate, 
    Pending Reviews, Response Score (penalized if they ghost candidates)
  - Quick actions: Post New Job, View Applications

PostJobPage.tsx:
  - Rich text editor for description (react-quill or tiptap)
  - Skill selector (tag input)
  - Type, location, salary range fields
  - "AI Analyze" button: sends JD to AI, returns:
    - Suggested skills to add
    - Clarity score (is the JD specific enough?)
    - Warning if requirements are vague/unrealistic
  - Preview tab: see how candidates will see the listing
  - Publish button (disabled if company not verified — show verification prompt)

CompanyApplicationsPage.tsx:
  - All applications across all jobs
  - Filter by job, status, date, match score
  - Bulk actions: move all to next stage, reject selected
  - REJECT action: required modal with reason input
    - Preset reasons: "Skills mismatch", "Overqualified", 
      "Position filled", "Experience level", "Custom..."
    - Custom reason: free text, min 20 characters
    - Cannot submit without selecting/typing a reason
  
  CompanyProfilePage.tsx:
  - Edit company info
  - Verification status + how to get verified
  - Response Score display with explanation

────────────────────────────────────────
PHASE 5 CHECKPOINT:
────────────────────────────────────────
[ ] Resume upload + AI parsing fills profile fields
[ ] Skill tags persist with proficiency levels
[ ] Profile completeness % calculates correctly
[ ] Company cannot post job without verification
[ ] Rejection modal enforces reason input (UI + API level)
[ ] Company response score deducts correctly
[ ] Job post with AI analysis gives useful feedback
```

---

---

# ═══════════════════════════════════════
# PHASE 6 — NOTIFICATIONS & EMAIL SYSTEM
# Estimated time: 1–2 days
# ═══════════════════════════════════════

```
[PASTE MASTER CONTEXT BLOCK ABOVE THIS LINE FIRST]

PHASE 6 TASK: All notifications — in-app, email, push (mobile).

────────────────────────────────────────
STEP 6.1 — Email Templates
────────────────────────────────────────
Create src/services/email.service.ts with these templates
(use React Email or MJML for beautiful HTML emails):

1. welcomeEmail(user) — "Welcome to SkillGap AI"
2. applicationConfirm(candidate, job) — "Application received"
3. applicationStatusUpdate(candidate, job, newStatus, reason?) —
   Generic status change email
4. rejectionWithGapReport(candidate, job, rejectionReason, gapReport) —
   THE KEY EMAIL: must include:
   - Personalized subject: "Update on your {jobTitle} application at {company}"
   - Warm, respectful tone
   - The rejection reason from the company
   - Top 3 skill gaps with explanations
   - Top 3 learning recommendations with links
   - CTA: "View your full gap report" → link to app
   - "We know this isn't the news you hoped for" — human tone
   
5. interviewInvite(candidate, job, date, details)
6. offerExtended(candidate, job)
7. passwordReset(user, otp)

All email templates must:
- Be mobile-responsive
- Use the SkillGap AI design system colors (inline CSS for email)
- Have both HTML and plain text versions
- Include unsubscribe link

────────────────────────────────────────
STEP 6.2 — In-App Notifications
────────────────────────────────────────
GET  /notifications (paginated, unread first)
POST /notifications/:id/read
POST /notifications/read-all
GET  /notifications/unread-count

In-app notification bell UI (web + mobile):
  - Bell icon in navbar with unread count badge
  - Dropdown panel with notification list
  - Each notification: icon, title, description, time ago
  - Click → navigate to relevant page
  - "Mark all read" button
  - Poll for new notifications every 60 seconds (or WebSocket if time permits)

Notification types with icons:
  - APPLICATION_RECEIVED (company) — green
  - STATUS_CHANGED (candidate) — blue
  - REJECTION_WITH_REPORT (candidate) — red (but styled helpfully)
  - INTERVIEW_SCHEDULED — yellow
  - OFFER_EXTENDED — gold star
  - SYSTEM — gray

────────────────────────────────────────
STEP 6.3 — Mobile Push Notifications
────────────────────────────────────────
Set up Expo Notifications:
  - Register device token on login, save to UserDevice table
  - Send push on same events as email
  - Handle foreground + background + killed app states
  - Deep link push taps: "View application" → opens correct screen

────────────────────────────────────────
PHASE 6 CHECKPOINT:
────────────────────────────────────────
[ ] Rejection email sends with gap report data populated
[ ] All email templates are mobile-responsive
[ ] In-app notification bell updates in real time
[ ] Push notifications arrive on both iOS and Android simulators
[ ] Unsubscribe link works
[ ] Email does not go to spam (check SPF/DKIM — at least documented)
```

---

---

# ═══════════════════════════════════════
# PHASE 7 — TESTING (comprehensive)
# Estimated time: 3 days
# ═══════════════════════════════════════

```
[PASTE MASTER CONTEXT BLOCK ABOVE THIS LINE FIRST]

PHASE 7 TASK: Full test suite. This is a final year project — it must have
good tests to demonstrate software engineering competency.

────────────────────────────────────────
STEP 7.1 — Unit Tests (Vitest)
────────────────────────────────────────
Write unit tests for ALL service files. Minimum coverage: 80%.

Critical test cases to write:

State machine tests (application.service.test.ts):
  - Valid transitions pass
  - Invalid transitions throw AppError
  - REJECTED without reason throws 400
  - Auto-rejection cron marks correct applications
  - Audit log entry created on every transition

AI service tests (ai.service.test.ts):
  - Mock OpenAI client
  - JSON parse failures trigger retry
  - Zod validation catches malformed AI response
  - Cache hit returns cached result without calling OpenAI

Auth tests (auth.service.test.ts):
  - Hashed password !== plaintext
  - Refresh token rotation invalidates old token
  - Blacklisted token is rejected
  - Rate limiting blocks after 5 failures

Use: Vitest + @testing-library/react for component tests
Mock: vi.mock() for OpenAI, nodemailer, S3

────────────────────────────────────────
STEP 7.2 — Integration Tests (Supertest)
────────────────────────────────────────
API integration tests using Supertest + test database:

Test database setup:
  - Use a separate PostgreSQL database for tests
  - Run migrations before test suite
  - Seed with fixture data
  - Truncate tables between tests (not drop/recreate — too slow)

Write tests for every API route:
  - Happy path (201/200 with correct response shape)
  - Auth required (401 if no token)
  - Role required (403 if wrong role)
  - Validation errors (400 with field-level errors)
  - Not found (404)
  - State machine violations (400 with clear message)

────────────────────────────────────────
STEP 7.3 — E2E Tests (Playwright — Web)
────────────────────────────────────────
Write Playwright E2E tests for these critical user journeys:

Journey 1: Candidate registers and applies for a job
  1. Go to /register
  2. Select Candidate role
  3. Fill details
  4. Add 5 skills in onboarding
  5. Browse to /jobs
  6. Click a job card
  7. Click "Apply Now"
  8. Upload resume
  9. Confirm application
  10. Assert: appear in /applications with APPLIED status

Journey 2: Company posts a job and rejects a candidate
  1. Login as company user
  2. Navigate to Post Job
  3. Fill job form
  4. Publish
  5. Assert: job appears in listings
  6. Find the application from Journey 1
  7. Move to REJECTED — assert: reason field is required
  8. Enter reason, confirm
  9. Assert: candidate's application shows REJECTED status

Journey 3: Gap report is generated and displayed
  1. Login as candidate
  2. Navigate to a rejected application
  3. Click "View Gap Report"
  4. Assert: match score visible
  5. Assert: at least one critical gap card rendered
  6. Assert: learning recommendations have links

Setup:
  - Use Playwright fixtures for auth (login once, reuse session)
  - Run against local dev server
  - Screenshots on failure

────────────────────────────────────────
STEP 7.4 — Mobile E2E (Detox — optional, or manual test checklist)
────────────────────────────────────────
If time permits: Detox E2E for mobile.
Otherwise, create a comprehensive manual test checklist document:
  - iOS Simulator: list each test case to verify manually
  - Android Emulator: same
  - Include screenshots guide

────────────────────────────────────────
STEP 7.5 — Test Coverage Report
────────────────────────────────────────
Configure Vitest coverage (v8 provider):
  - Generate HTML coverage report
  - Minimum thresholds:
    services/: 85%
    routes/controllers: 80%
    utils/: 90%
  - CI will fail below these thresholds

────────────────────────────────────────
PHASE 7 CHECKPOINT:
────────────────────────────────────────
[ ] pnpm test passes with zero failures
[ ] Coverage report shows 80%+ on services
[ ] Playwright E2E Journey 1 passes
[ ] Playwright E2E Journey 2 (rejection enforcement) passes
[ ] Playwright E2E Journey 3 (gap report) passes
[ ] All edge cases (invalid transitions, missing fields) tested
```

---

---

# ═══════════════════════════════════════
# PHASE 8 — DOCUMENTATION
# Estimated time: 1–2 days
# ═══════════════════════════════════════

```
[PASTE MASTER CONTEXT BLOCK ABOVE THIS LINE FIRST]

PHASE 8 TASK: Full project documentation — API docs, component docs,
architecture docs, and the README. Required for final year submission.

────────────────────────────────────────
STEP 8.1 — API Documentation (Swagger/OpenAPI)
────────────────────────────────────────
Every API route must have OpenAPI annotations:

/**
 * @openapi
 * /applications/{id}/status:
 *   patch:
 *     summary: Update application status
 *     description: Transitions an application to a new status.
 *       When transitioning to REJECTED, rejectionReason is mandatory.
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 $ref: '#/components/schemas/ApplicationStatus'
 *               rejectionReason:
 *                 type: string
 *                 description: Required when status is REJECTED
 *                 minLength: 10
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       400:
 *         description: Invalid transition or missing rejection reason
 *       403:
 *         description: Not authorized (must be job owner)
 */

Serve Swagger UI at /api/docs (dev only or with auth in prod)

────────────────────────────────────────
STEP 8.2 — Component Storybook
────────────────────────────────────────
Every shared UI component must have Storybook stories:
  - Default story
  - All variants
  - Loading state
  - Error/empty state
  - Interactive controls (Storybook Controls addon)

Add these special stories:
  - GapReport — with realistic mock data
  - ApplicationTracker — kanban with multiple cards
  - MatchScore — all score ranges (low/mid/high)
  - JobCard — verified vs unverified, with/without salary

Deploy Storybook to GitHub Pages (document this in README)

────────────────────────────────────────
STEP 8.3 — Architecture Documentation
────────────────────────────────────────
Create docs/ARCHITECTURE.md:
  - System overview diagram (can embed the SVG from earlier)
  - Database ERD (generate from Prisma schema with prisma-erd-generator)
  - Application state machine diagram
  - AI pipeline flow (JD → skill extraction → gap analysis → report)
  - Tech stack decisions with rationale (why Turborepo, why Prisma, etc.)
  - Security decisions (JWT rotation, password hashing, rate limiting)
  - Scalability notes (how to scale each service independently)

Create docs/API.md — generated from Swagger
Create docs/DEPLOYMENT.md — step by step deployment guide
Create docs/TESTING.md — how to run tests

────────────────────────────────────────
STEP 8.4 — Main README
────────────────────────────────────────
Create a comprehensive README.md at root:

# SkillGap AI
> Intelligent job-skill matching platform that solves candidate communication
> and ATS transparency problems in modern hiring.

Sections:
  - Project Overview (the 3 problems solved)
  - Live Demo links (web + Expo Go QR code)
  - Screenshots (6-8 key screens)
  - Features list
  - Tech Stack with badges
  - Architecture overview
  - Quick Start (5 steps to run locally)
  - Environment Variables table (all vars with description, no real values)
  - Testing instructions
  - Deployment guide
  - Contributing guide
  - License

────────────────────────────────────────
PHASE 8 CHECKPOINT:
────────────────────────────────────────
[ ] Swagger UI accessible at /api/docs
[ ] Every endpoint documented with request/response schemas
[ ] All components have Storybook stories
[ ] README has screenshots + working quick start
[ ] ARCHITECTURE.md has ERD generated from real schema
[ ] docs/ folder is complete
```

---

---

# ═══════════════════════════════════════
# PHASE 9 — CI/CD & DEPLOYMENT
# Estimated time: 1–2 days
# ═══════════════════════════════════════

```
[PASTE MASTER CONTEXT BLOCK ABOVE THIS LINE FIRST]

PHASE 9 TASK: GitHub Actions CI/CD, deployment configuration,
environment setup, and production readiness.

────────────────────────────────────────
STEP 9.1 — GitHub Actions Workflows
────────────────────────────────────────
Create .github/workflows/ci.yml:

Triggers: push to main, PR to main

Jobs:

1. quality-check:
   - pnpm install (with caching)
   - TypeScript check (tsc --noEmit)
   - ESLint (pnpm lint)
   - Prettier check (pnpm format:check)

2. test:
   - needs: quality-check
   - Start PostgreSQL service (GitHub Actions service container)
   - Start Redis service
   - Run migrations on test DB
   - pnpm test (unit + integration)
   - Upload coverage report artifact
   - Fail if coverage below threshold

3. build:
   - needs: test
   - Build all apps (pnpm build)
   - Build Docker image for API
   - Push to GitHub Container Registry

4. deploy-preview (on PR):
   - Deploy web to Vercel preview URL
   - Comment preview URL on PR

5. deploy-production (on push to main only):
   - Deploy web to Vercel production
   - Deploy API to Railway
   - Run smoke tests against production URLs

Create .github/workflows/mobile.yml:
   - Trigger: push to main + tag v*
   - Expo EAS Build (iOS + Android)
   - EAS Submit to TestFlight + Play Store Internal Track

────────────────────────────────────────
STEP 9.2 — Environment Configuration
────────────────────────────────────────
Create comprehensive .env.example files for each app.

apps/api/.env.example:
```
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/skillgap_dev
REDIS_URL=redis://localhost:6379

# JWT
JWT_ACCESS_SECRET=<generate with: openssl rand -hex 64>
JWT_REFRESH_SECRET=<generate with: openssl rand -hex 64>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# OpenAI
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o

# AWS S3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=ap-south-1
AWS_S3_BUCKET=

# Email (SendGrid)
SENDGRID_API_KEY=
EMAIL_FROM=noreply@skillgapai.com
EMAIL_FROM_NAME=SkillGap AI

# App
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173
API_URL=http://localhost:3001
```

Validate all env variables on startup using Zod:
```typescript
// src/lib/env.ts
const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(32),
  OPENAI_API_KEY: z.string().startsWith('sk-'),
  // ... all variables
});
export const env = envSchema.parse(process.env);
// If invalid, throw with clear message listing missing variables
```

────────────────────────────────────────
STEP 9.3 — Deployment Configuration
────────────────────────────────────────
Vercel (web):
  - vercel.json in apps/web/
  - SPA rewrite rules (all routes → index.html)
  - Environment variables via Vercel dashboard

Railway (API):
  - Dockerfile in apps/api/
  - railway.json configuration
  - Health check endpoint: GET /health
    Returns: { status: 'ok', version, uptime, dbConnected, redisConnected }

Database (Railway PostgreSQL or Supabase):
  - Production migration command in Procfile
  - Connection pooling with pgbouncer config

Expo EAS (Mobile):
  - eas.json with development/preview/production profiles
  - app.config.ts with env-aware configuration
  - iOS: Bundle ID, provisioning (guide to set up)
  - Android: applicationId, keystore (guide to set up)
  - OTA updates enabled for non-native changes

────────────────────────────────────────
STEP 9.4 — Production Security Checklist
────────────────────────────────────────
Implement before deploying to production:

[ ] Helmet.js configured with strict CSP headers
[ ] All API responses stripped of stack traces in production
[ ] Rate limiting on all public endpoints
[ ] Input sanitization (DOMPurify for any HTML, parameterized queries via Prisma)
[ ] File upload: validate MIME type (not just extension), virus scan stub
[ ] CORS: whitelist only known origins
[ ] JWT secrets min 64 chars, rotated mechanism documented
[ ] No console.log in production (use a logger like winston/pino)
[ ] /health endpoint does NOT expose sensitive info
[ ] Database: no direct public access, only via API
[ ] S3 bucket: private, presigned URLs only

────────────────────────────────────────
PHASE 9 CHECKPOINT:
────────────────────────────────────────
[ ] GitHub Actions CI passes on every push
[ ] Failed tests block merge to main (branch protection rule enabled)
[ ] Web deploys to Vercel automatically on merge to main
[ ] API deploys to Railway automatically on merge to main
[ ] /health endpoint returns 200 in production
[ ] All env variables documented in .env.example
[ ] Expo build succeeds for iOS and Android
[ ] Production smoke tests pass
```

---

---

# ═══════════════════════════════════════
# PHASE 10 — POST-PRODUCTION & POLISH
# Estimated time: 1–2 days
# ═══════════════════════════════════════

```
[PASTE MASTER CONTEXT BLOCK ABOVE THIS LINE FIRST]

PHASE 10 TASK: Analytics, error monitoring, performance, accessibility audit,
and final polish for demo-readiness.

────────────────────────────────────────
STEP 10.1 — Error Monitoring (Sentry)
────────────────────────────────────────
Install Sentry in all three apps:
  - Web: @sentry/react with React Router integration
  - Mobile: @sentry/react-native
  - API: @sentry/node with Express integration

Configure:
  - Source maps upload in CI/CD
  - User context attached on login
  - Custom Sentry tags: role, appVersion
  - Alert rules: > 10 errors/minute, new error types

────────────────────────────────────────
STEP 10.2 — Analytics (Posthog — open source, privacy-friendly)
────────────────────────────────────────
Install Posthog (posthog-js for web, posthog-react-native for mobile):

Track these events:
  - user_registered (with role property)
  - job_viewed (with job_id, match_score)
  - job_applied
  - gap_report_viewed
  - learning_resource_clicked
  - company_posted_job
  - rejection_sent (with has_reason: true/false — key metric!)

────────────────────────────────────────
STEP 10.3 — Performance Optimization
────────────────────────────────────────
Web:
  - Code splitting: lazy() + Suspense on all route components
  - Image optimization: webp format, lazy loading
  - Bundle analyzer: run vite-bundle-visualizer, keep main chunk < 200kb
  - TanStack Query: configure staleTime (5min for jobs, 30min for skills)
  - Add React.memo to JobCard and GapReportCard (rendered many times)
  - Lighthouse score targets: Performance > 90, Accessibility > 95

API:
  - Add Redis caching for:
    - GET /jobs (1min TTL, bust on new post)
    - GET /skills (1 hour TTL — rarely changes)
    - AI gap reports (24hr TTL — same inputs = same output)
  - Add database indexes (run EXPLAIN ANALYZE on slow queries)
  - Compress responses with compression middleware

────────────────────────────────────────
STEP 10.4 — Accessibility Audit
────────────────────────────────────────
Run axe-core on all major pages and fix all issues.

Must pass:
  - All images have alt text
  - All form inputs have labels
  - Color contrast ratio 4.5:1 minimum (check with WebAIM)
  - Tab order is logical on all pages
  - Skip-to-main-content link
  - Modal traps focus correctly
  - Status badge colors NOT the only indicator (add icon + text too)
  - Kanban board accessible via keyboard (not just drag-and-drop)

────────────────────────────────────────
STEP 10.5 — Demo Data Seed Script
────────────────────────────────────────
Create prisma/seed.ts with realistic demo data:
  - 5 verified companies (different industries)
  - 20 job listings (mix of types and requirements)
  - 3 candidate profiles (different skill levels)
  - 10 applications (various statuses)
  - 5 gap reports with realistic AI-generated content
  - Notifications for each status change

Run with: pnpm db:seed
Reset with: pnpm db:reset (drops + recreates + seeds)

This seed script is for demos and presentations.
Add demo credentials to README:
  Candidate: demo@candidate.com / Demo@1234
  Company:   demo@company.com  / Demo@1234

────────────────────────────────────────
FINAL PROJECT CHECKLIST
────────────────────────────────────────
Before final submission, verify ALL of the following:

FUNCTIONALITY:
[ ] New candidate can register, upload resume, get skills parsed
[ ] Job search works with all filters
[ ] Verified company badge visible on job cards
[ ] Apply to job creates gap report automatically
[ ] Application tracker shows all statuses correctly
[ ] Company CANNOT reject without entering a reason (test this!)
[ ] Rejection email received with gap report content
[ ] Gap report screen shows all sections with correct data
[ ] Push notifications arrive on mobile

CODE QUALITY:
[ ] Zero TypeScript errors (pnpm typecheck)
[ ] Zero ESLint errors (pnpm lint)
[ ] Test coverage > 80% on services
[ ] No secrets in git history (run: git log -p | grep -i 'api_key\|secret\|password')
[ ] .env.example up to date

DEPLOYMENT:
[ ] Live web URL works and loads in < 3 seconds
[ ] API /health returns 200
[ ] Mobile app installable via Expo Go QR code
[ ] CI/CD pipeline green on main branch

DOCUMENTATION:
[ ] README has live demo links + screenshots
[ ] Swagger UI accessible and complete
[ ] ARCHITECTURE.md has ERD
[ ] All env variables in .env.example

PRESENTATION READY:
[ ] Demo seed data loaded on production
[ ] Demo accounts work (candidate + company)
[ ] The rejection-without-reason guard is demonstrable live
[ ] Gap report is populated with realistic, readable data
[ ] Mobile app runs on a real phone or clean simulator
```

---

---

# APPENDIX A — FOLDER STRUCTURE (final)

```
skillgap-ai/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── mobile.yml
├── apps/
│   ├── web/
│   │   ├── src/
│   │   │   ├── components/  (feature components)
│   │   │   ├── pages/
│   │   │   ├── stores/      (Zustand)
│   │   │   ├── hooks/       (custom hooks)
│   │   │   ├── lib/         (api.ts, queryClient.ts)
│   │   │   └── utils/
│   │   ├── vite.config.ts
│   │   └── package.json
│   ├── mobile/
│   │   ├── app/             (expo-router)
│   │   │   ├── (auth)/
│   │   │   ├── (tabs)/
│   │   │   └── _layout.tsx
│   │   ├── components/
│   │   ├── eas.json
│   │   └── app.config.ts
│   └── api/
│       ├── src/
│       │   ├── routes/
│       │   ├── controllers/
│       │   ├── services/
│       │   ├── middleware/
│       │   ├── lib/
│       │   └── types/
│       ├── prisma/
│       │   ├── schema.prisma
│       │   ├── migrations/
│       │   └── seed.ts
│       └── Dockerfile
├── packages/
│   ├── ui/            (Storybook here)
│   ├── types/
│   ├── utils/
│   └── config/
├── docs/
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── TESTING.md
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
└── README.md
```

# APPENDIX B — QUICK COMMAND REFERENCE

```bash
# Start all apps
pnpm dev

# Run all tests
pnpm test

# Type check everything
pnpm typecheck

# Lint everything
pnpm lint

# Build everything
pnpm build

# Database commands
pnpm db:migrate      # run migrations
pnpm db:seed         # seed demo data
pnpm db:reset        # drop + migrate + seed
pnpm db:studio       # open Prisma Studio

# Storybook
pnpm storybook

# Generate coverage report
pnpm test:coverage

# E2E tests
pnpm test:e2e

# Mobile build
pnpm eas:build:preview
pnpm eas:build:production
```

---

*This prompt was built for SkillGap AI — Final Year Project.*
*Follow the phases in order. Complete each checkpoint before moving on.*
*Good luck — you're building something that actually matters.*