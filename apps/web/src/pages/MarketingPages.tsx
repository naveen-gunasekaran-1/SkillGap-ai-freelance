import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Button, Card } from '@skillgap/ui';
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BookOpenCheck,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  ClipboardCheck,
  FileSearch,
  GraduationCap,
  KeyRound,
  LockKeyhole,
  MessageSquareText,
  Radar,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { Navbar } from '../components/Navbar';

const featureGroups = [
  {
    title: 'For candidates',
    desc: 'Turn every profile and application into a clear skill map.',
    icon: GraduationCap,
    items: [
      'Resume-backed skill extraction',
      'Match score for every job',
      'Actionable gap explanations',
      'Learning path suggestions',
    ],
  },
  {
    title: 'For companies',
    desc: 'Review applicants with evidence, structure, and accountability.',
    icon: BriefcaseBusiness,
    items: [
      'Verified company workspace',
      'Applicant match comparison',
      'Structured rejection reasons',
      'Hiring pipeline visibility',
    ],
  },
  {
    title: 'For admins',
    desc: 'Keep employer access, reviews, and sensitive actions auditable.',
    icon: ClipboardCheck,
    items: [
      'Company verification queue',
      'Role-based access controls',
      'Audit trail for sensitive actions',
      'Trust and storage configuration',
    ],
  },
];

const featureHighlights = [
  {
    title: 'Explainable AI matching',
    desc: 'SkillGap AI compares candidate evidence against job requirements so users see why a job is a strong or weak match.',
    icon: Radar,
  },
  {
    title: 'Transparent application outcomes',
    desc: 'Companies can move applicants through a real pipeline and record clear reasons when a candidate is not selected.',
    icon: MessageSquareText,
  },
  {
    title: 'Learning-focused next steps',
    desc: 'Candidates receive concrete areas to improve, not vague advice or silent rejection loops.',
    icon: BookOpenCheck,
  },
  {
    title: 'Verified employer trust',
    desc: 'Employer workspaces are designed around verification before sensitive applicant workflows open up.',
    icon: BadgeCheck,
  },
];

const pricingPlans = [
  {
    name: 'Candidate',
    price: 'Free',
    desc: 'For students, graduates, and job seekers building a stronger profile.',
    cta: 'Start free',
    to: '/register',
    featured: false,
    items: [
      'Create your candidate profile',
      'Browse jobs and view match signals',
      'Track applications',
      'See skill gaps and recommendations',
    ],
  },
  {
    name: 'Company',
    price: 'Contact us',
    desc: 'For teams that need verified job posts and explainable applicant review.',
    cta: 'Talk to us',
    to: '/contact',
    featured: true,
    items: [
      'Company verification workflow',
      'Post and manage jobs',
      'Review matched applicants',
      'Pipeline and rejection transparency tools',
    ],
  },
  {
    name: 'Institution',
    price: 'Custom',
    desc: 'For placement cells, colleges, and demo environments.',
    cta: 'Request setup',
    to: '/contact',
    featured: false,
    items: [
      'Campus-ready onboarding',
      'Student employability insights',
      'Admin review support',
      'Final-year project demo configuration',
    ],
  },
];

const securityControls = [
  {
    title: 'Role-based access',
    desc: 'Candidates, companies, and admins land in separate protected workspaces with role checks at route level.',
    icon: KeyRound,
  },
  {
    title: 'Verified company access',
    desc: 'Company trust workflows are built around verification before employers handle sensitive hiring activity.',
    icon: UserCheck,
  },
  {
    title: 'Private document handling',
    desc: 'Candidate documents and application evidence are treated as protected hiring records.',
    icon: LockKeyhole,
  },
  {
    title: 'Audit-ready operations',
    desc: 'Admin review and sensitive actions are structured so platform decisions can be inspected later.',
    icon: ReceiptText,
  },
];

function PageShell({
  badge,
  title,
  description,
  children,
}: {
  badge: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
}): React.JSX.Element {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 py-14 lg:py-20">
        <section className="max-w-3xl">
          {badge}
          <h1
            className="mt-5 font-display text-4xl font-bold tracking-tight text-text-primary md:text-6xl"
            style={{ lineHeight: 1.08 }}
          >
            {title}
          </h1>
          <p className="mt-6 text-lg leading-8 text-text-secondary">{description}</p>
        </section>
        {children}
      </main>
    </div>
  );
}

export function FeaturesPage(): React.JSX.Element {
  return (
    <PageShell
      badge={
        <Badge variant="ai">
          <Sparkles className="mr-1.5 h-3.5 w-3.5" />
          Features
        </Badge>
      }
      title="Hiring clarity for candidates, companies, and admins."
      description="SkillGap AI brings skill evidence, job matching, employer verification, and application transparency into one workflow."
    >
      <section className="mt-12 grid gap-5 lg:grid-cols-3">
        {featureGroups.map((group) => {
          const Icon = group.icon;
          return (
            <Card key={group.title} className="p-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-light text-primary">
                <Icon className="h-6 w-6" />
              </span>
              <h2 className="mt-5 text-xl font-semibold text-text-primary">{group.title}</h2>
              <p className="mt-2 text-sm leading-6 text-text-secondary">{group.desc}</p>
              <div className="mt-5 space-y-3">
                {group.items.map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm text-text-secondary">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </section>

      <section className="mt-14 grid gap-5 md:grid-cols-2">
        {featureHighlights.map((feature) => {
          const Icon = feature.icon;
          return (
            <div key={feature.title} className="rounded-card border border-border bg-white p-6 shadow-card">
              <Icon className="h-6 w-6 text-primary" />
              <h2 className="mt-4 text-lg font-semibold text-text-primary">{feature.title}</h2>
              <p className="mt-2 text-sm leading-6 text-text-secondary">{feature.desc}</p>
            </div>
          );
        })}
      </section>

      <section className="mt-14 rounded-card border border-border bg-white p-6 shadow-card md:flex md:items-center md:justify-between md:gap-8">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Ready to try the workflow?</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Create an account or browse public jobs to see SkillGap AI in action.
          </p>
        </div>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row md:mt-0">
          <Link to="/register">
            <Button variant="ai-gradient">
              Get started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link to="/jobs">
            <Button variant="secondary">Browse jobs</Button>
          </Link>
        </div>
      </section>
    </PageShell>
  );
}

export function PricingPage(): React.JSX.Element {
  return (
    <PageShell
      badge={<Badge variant="info">Pricing</Badge>}
      title="Simple access for candidates, guided setup for teams."
      description="Start free as a candidate. Companies and institutions can request onboarding so verification, job posts, and review workflows are configured correctly."
    >
      <section className="mt-12 grid gap-5 lg:grid-cols-3">
        {pricingPlans.map((plan) => (
          <Card
            key={plan.name}
            className={`p-6 ${plan.featured ? 'border-primary shadow-card-hover' : ''}`}
          >
            {plan.featured ? (
              <Badge variant="ai" className="mb-4">
                Recommended
              </Badge>
            ) : null}
            <h2 className="text-xl font-semibold text-text-primary">{plan.name}</h2>
            <p className="mt-3 text-3xl font-bold text-text-primary">{plan.price}</p>
            <p className="mt-3 min-h-16 text-sm leading-6 text-text-secondary">{plan.desc}</p>
            <div className="mt-6 space-y-3">
              {plan.items.map((item) => (
                <div key={item} className="flex items-start gap-3 text-sm text-text-secondary">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <Link to={plan.to} className="mt-6 block">
              <Button
                variant={plan.featured ? 'ai-gradient' : 'secondary'}
                className="w-full"
                type="button"
              >
                {plan.cta}
              </Button>
            </Link>
          </Card>
        ))}
      </section>

      <section className="mt-14 grid gap-5 md:grid-cols-3">
        {[
          ['No surprise candidate fees', 'Candidates can create accounts and explore jobs without a paid plan.'],
          ['Verification-first company setup', 'Employer workflows are configured around trust and accountability.'],
          ['Project-friendly deployment', 'The setup works for demos, pilots, and production hosting on Netlify.'],
        ].map(([title, desc]) => (
          <div key={title} className="rounded-card border border-border bg-white p-5 shadow-card">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h2 className="mt-3 font-semibold text-text-primary">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-text-secondary">{desc}</p>
          </div>
        ))}
      </section>
    </PageShell>
  );
}

export function SecurityPage(): React.JSX.Element {
  return (
    <PageShell
      badge={
        <Badge variant="success">
          <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
          Security
        </Badge>
      }
      title="Security and trust controls for explainable hiring."
      description="SkillGap AI is designed so candidates, companies, and admins only access the workflows and records meant for their role."
    >
      <section className="mt-12 grid gap-5 md:grid-cols-2">
        {securityControls.map((control) => {
          const Icon = control.icon;
          return (
            <Card key={control.title} className="p-6">
              <Icon className="h-6 w-6 text-success" />
              <h2 className="mt-4 text-lg font-semibold text-text-primary">{control.title}</h2>
              <p className="mt-2 text-sm leading-6 text-text-secondary">{control.desc}</p>
            </Card>
          );
        })}
      </section>

      <section className="mt-14 grid gap-8 rounded-card border border-border bg-white p-6 shadow-card lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <FileSearch className="h-8 w-8 text-primary" />
          <h2 className="mt-4 text-2xl font-semibold text-text-primary">
            Built to make decisions reviewable.
          </h2>
          <p className="mt-3 text-sm leading-6 text-text-secondary">
            The platform favors structured reasons, verified access, and clear records so hiring
            outcomes can be explained instead of guessed.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            'Protected account routes',
            'Company verification status',
            'Applicant review structure',
            'Admin verification queue',
            'Sensitive action logs',
            'Private resume workflows',
          ].map((item) => (
            <div key={item} className="flex items-center gap-3 rounded-card bg-background p-3 text-sm text-text-secondary">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14 rounded-card border border-border bg-white p-6 shadow-card md:flex md:items-center md:justify-between md:gap-8">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Need security setup help?</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Contact us for admin, storage, verification, or deployment configuration support.
          </p>
        </div>
        <Link to="/contact" className="mt-5 inline-flex md:mt-0">
          <Button variant="ai-gradient">
            Contact us
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </section>
    </PageShell>
  );
}
