import { Link } from 'react-router-dom';
import { Button, Badge } from '@skillgap/ui';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Check,
  CheckCircle2,
  FileText,
  Lightbulb,
  MessageSquareText,
  Radar,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
} from 'lucide-react';
import { Navbar } from '../components/Navbar';

const steps = [
  {
    num: '01',
    title: 'Upload Your Profile',
    desc: 'Add your skills, experience, and resume. Our AI parses everything automatically.',
    icon: FileText,
  },
  {
    num: '02',
    title: 'Get Matched & Analyzed',
    desc: "AI compares your profile against job descriptions and finds exactly what's missing.",
    icon: Search,
  },
  {
    num: '03',
    title: 'Close the Gap',
    desc: 'Receive personalized learning paths, courses, and project recommendations.',
    icon: Rocket,
  },
];

const features = [
  {
    title: 'AI Gap Analysis',
    desc: "Know exactly which skills you're missing and why — not just a rejection email.",
    icon: Lightbulb,
    gradient: true,
  },
  {
    title: 'Verified Companies',
    desc: 'Every employer is GSTIN/MCA verified. No fake job postings, ever.',
    icon: ShieldCheck,
    gradient: false,
  },
  {
    title: 'Smart Matching',
    desc: 'Get a match percentage for every job based on your real skill profile.',
    icon: Target,
    gradient: false,
  },
  {
    title: 'Learning Paths',
    desc: 'Curated courses, projects, and resources ranked by impact on your employability.',
    icon: BookOpen,
    gradient: false,
  },
  {
    title: 'Transparent Rejections',
    desc: 'Companies must provide rejection reasons. Platform-enforced, not optional.',
    icon: MessageSquareText,
    gradient: false,
  },
  {
    title: 'Real-Time Tracking',
    desc: 'Track every application status with timeline updates and SLA enforcement.',
    icon: BarChart3,
    gradient: false,
  },
];

const stats = [
  { value: '12k+', label: 'Job matches analyzed' },
  { value: '89%', label: 'Users find gaps faster' },
  { value: '24h', label: 'To get a clear roadmap' },
  { value: '95%', label: 'Rejection transparency rate' },
];

/**
 * Landing page — the first screen users see. Contains hero section,
 * how it works steps, features grid, stats, and footer.
 */
export function LandingPage(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-transparent">
      <Navbar />

      {/* ═══ HERO SECTION ═══ */}
      <main className="mx-auto max-w-7xl px-6 pt-12 pb-20 md:pt-20 md:pb-28">
        <section className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="animate-fade-in-up">
            <Badge
              variant="ai"
              className="mb-6 px-4 py-1.5 text-xs font-semibold tracking-wide uppercase"
            >
              <Sparkles className="mr-1.5 inline h-3.5 w-3.5" />
              Explainable AI hiring infrastructure
            </Badge>
            <h1
              className="max-w-2xl font-display text-4xl font-bold tracking-tight text-text-primary sm:text-5xl md:text-6xl"
              style={{ lineHeight: 1.1 }}
            >
              Rejections should come with evidence, not silence.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-text-secondary md:text-xl">
              SkillGap AI turns every application into an explainable record: skill evidence, hiring
              rationale, and a learning path candidates can actually act on.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/register">
                <Button size="lg" variant="ai-gradient" className="shadow-lg hover:shadow-xl">
                  Get started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/jobs">
                <Button variant="secondary" size="lg" className="shadow-card">
                  Browse jobs
                </Button>
              </Link>
            </div>

            {/* Stats row */}
            <div className="mt-12 grid gap-4 sm:grid-cols-4">
              {stats.map((stat, i) => (
                <div
                  key={stat.label}
                  className="animate-fade-in-up rounded-card border border-border bg-white/80 p-4 shadow-card backdrop-blur-sm"
                  style={{ animationDelay: `${(i + 2) * 100}ms` }}
                >
                  <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
                  <p className="mt-1 text-xs text-text-secondary">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Hero preview card */}
          <div className="animate-fade-in-up delay-300 rounded-[28px] border border-border bg-white/85 p-5 shadow-card backdrop-blur-sm md:p-7">
            <div className="rounded-[20px] bg-gradient-to-br from-primary-light via-white to-ai-cyan/10 p-5 md:p-7">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-text-secondary">
                    Recommended next step
                  </p>
                  <h2 className="mt-1.5 text-xl font-bold text-text-primary md:text-2xl">
                    Frontend Engineer
                  </h2>
                  <p className="mt-1 text-sm text-text-secondary">TechCorp • San Francisco, CA</p>
                </div>
                <div className="rounded-full bg-white px-4 py-2 text-sm font-bold text-primary shadow-card">
                  88% match
                </div>
              </div>
              <div className="mt-5 space-y-3">
                <div className="rounded-card bg-white p-4 shadow-card hover-lift">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success/10 text-success">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <p className="text-sm font-medium text-text-secondary">Strong match areas</p>
                  </div>
                  <p className="mt-1.5 font-medium text-text-primary">
                    React, TypeScript, UI systems
                  </p>
                </div>
                <div className="rounded-card bg-white p-4 shadow-card hover-lift">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-warning/10 text-warning">
                      <Radar className="h-3.5 w-3.5" />
                    </span>
                    <p className="text-sm font-medium text-text-secondary">Top gap to close</p>
                  </div>
                  <p className="mt-1.5 font-medium text-text-primary">
                    Advanced TypeScript patterns
                  </p>
                </div>
                <div className="rounded-card bg-white p-4 shadow-card hover-lift">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-light text-primary">
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                    <p className="text-sm font-medium text-text-secondary">Suggested path</p>
                  </div>
                  <p className="mt-1.5 font-medium text-text-primary">
                    Course + project + interview practice
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="border-t border-border/60 bg-white/50 py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <Badge variant="info" className="mb-4">
              How It Works
            </Badge>
            <h2 className="font-display text-3xl font-bold text-text-primary md:text-4xl">
              Three steps to career clarity
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-text-secondary">
              No more guessing why you didn't get the job. SkillGap AI gives you the exact roadmap.
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className="group relative rounded-2xl border border-border bg-white p-7 shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-xs font-bold uppercase tracking-widest text-text-secondary">
                      {step.num}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">{step.desc}</p>
                  {i < steps.length - 1 && (
                    <div className="absolute -right-4 top-1/2 hidden -translate-y-1/2 text-border md:block">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES GRID ═══ */}
      <section id="features" className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <Badge variant="ai" className="mb-4">
              Features
            </Badge>
            <h2 className="font-display text-3xl font-bold text-text-primary md:text-4xl">
              Everything you need to land the right job
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-text-secondary">
              Built specifically for students, graduates, and first-time job seekers who are tired
              of the black-box ATS experience.
            </p>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className={`group rounded-2xl border p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover ${
                    feat.gradient
                      ? 'border-transparent bg-gradient-to-br from-ai-purple/5 to-ai-cyan/5 shadow-card'
                      : 'border-border bg-white shadow-card'
                  }`}
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-light text-primary transition-transform duration-200 group-hover:scale-110">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-text-primary">{feat.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="security" className="border-t border-border/60 bg-white py-20 md:py-28">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <Badge variant="success" className="mb-4">
              <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
              Security & compliance
            </Badge>
            <h2 className="font-display text-3xl font-bold text-text-primary md:text-4xl">
              Built for recruiter accountability.
            </h2>
            <p className="mt-4 text-text-secondary">
              Verified companies, private document storage, role-based access, and audit trails make
              hiring decisions reviewable instead of opaque.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              'Company verification before applicant access',
              'Structured rejection reasoning',
              'Private signed document review',
              'Admin audit logs for sensitive actions',
            ].map((item) => (
              <div
                key={item}
                className="rounded-card border border-border bg-background/70 p-4 shadow-card"
              >
                <CheckCircle2 className="h-5 w-5 text-success" />
                <p className="mt-3 text-sm font-medium text-text-primary">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA SECTION ═══ */}
      <section id="pricing" className="border-t border-border/60 bg-white/50 py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-display text-3xl font-bold text-text-primary md:text-4xl">
            Ready to close your skills gap?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-text-secondary">
            Join thousands of students who already know exactly what to learn next.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link to="/register">
              <Button size="lg" variant="ai-gradient" className="shadow-lg">
                Get started for free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/jobs">
              <Button variant="secondary" size="lg">
                Browse jobs first
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-border bg-white/80 py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-6 md:flex-row md:justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-ai-cyan shadow-card" />
            <span className="font-semibold text-text-primary">SkillGap AI</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-text-secondary">
            <Link to="/#features" className="hover:text-text-primary transition-colors">
              Features
            </Link>
            <Link to="/for-companies" className="hover:text-text-primary transition-colors">
              For Companies
            </Link>
            <Link to="/#pricing" className="hover:text-text-primary transition-colors">
              Pricing
            </Link>
            <Link to="/#security" className="hover:text-text-primary transition-colors">
              Security
            </Link>
            <Link to="/contact" className="hover:text-text-primary transition-colors">
              Contact
            </Link>
          </div>
          <p className="text-xs text-text-secondary">
            © 2026 SkillGap AI. Built for final year project.
          </p>
        </div>
      </footer>
    </div>
  );
}
