import { Link } from 'react-router-dom';
import { Badge, Button } from '@skillgap/ui';
import { Navbar } from '../components/Navbar';

const benefits = [
  {
    title: 'Hire with match scores',
    desc: 'Review candidates by skill fit, missing skills, and readiness instead of scanning resumes manually.',
  },
  {
    title: 'Post verified opportunities',
    desc: 'Build trust with candidates using verified company profiles and transparent job details.',
  },
  {
    title: 'Track applicants clearly',
    desc: 'Move applicants through review, shortlist, interview, and offer stages with a focused hiring workspace.',
  },
];

const workflow = [
  'Create a verified company account',
  'Publish jobs with required skills',
  'Review candidates by match score',
  'Shortlist and manage the hiring pipeline',
];

export function ForCompaniesPage(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main>
        <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-[1fr_0.9fr] lg:py-24">
          <div>
            <Badge variant="ai" className="mb-5">
              For Companies
            </Badge>
            <h1 className="max-w-3xl font-display text-4xl font-bold tracking-tight text-text-primary md:text-6xl" style={{ lineHeight: 1.08 }}>
              Hire candidates by verified skills, not guesswork.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-text-secondary">
              SkillGap AI gives companies a focused hiring workspace for posting jobs, reviewing applicants,
              comparing skill fit, and managing candidates through a transparent pipeline.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/register">
                <Button size="lg" variant="ai-gradient">
                  Create company account
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="secondary">
                  Sign in
                </Button>
              </Link>
            </div>
          </div>

          <div className="rounded-[28px] border border-border bg-white p-5 shadow-card">
            <div className="rounded-[20px] bg-background p-5">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-text-secondary">Candidate review</p>
                  <h2 className="mt-1 text-xl font-bold text-text-primary">Frontend Engineer</h2>
                </div>
                <span className="rounded-full bg-success/10 px-3 py-1 text-sm font-semibold text-success">92% match</span>
              </div>
              <div className="mt-5 space-y-3">
                {[
                  ['Strong skills', 'React, TypeScript, CSS'],
                  ['Missing skills', 'GraphQL, testing depth'],
                  ['Recommended action', 'Shortlist for technical screen'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-card bg-white p-4 shadow-card">
                    <p className="text-xs font-medium uppercase tracking-wider text-text-secondary">{label}</p>
                    <p className="mt-1 font-semibold text-text-primary">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-white/60 py-16">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid gap-5 md:grid-cols-3">
              {benefits.map((benefit) => (
                <div key={benefit.title} className="rounded-2xl border border-border bg-white p-6 shadow-card">
                  <h3 className="text-lg font-semibold text-text-primary">{benefit.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-text-secondary">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1fr]">
            <div>
              <Badge variant="info" className="mb-4">
                Hiring workflow
              </Badge>
              <h2 className="font-display text-3xl font-bold text-text-primary">A company-side flow built for action</h2>
              <p className="mt-4 text-text-secondary">
                Companies get their own dashboard, job management screens, candidate review tools, and hiring pipeline.
              </p>
            </div>
            <div className="space-y-3">
              {workflow.map((item, index) => (
                <div key={item} className="flex items-center gap-4 rounded-card border border-border bg-white p-4 shadow-card">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-light text-sm font-bold text-primary">
                    {index + 1}
                  </span>
                  <p className="font-medium text-text-primary">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
