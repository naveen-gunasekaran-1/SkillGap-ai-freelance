import { Link } from 'react-router-dom';
import { Button } from '@skillgap/ui';
import { Navbar } from '../components/Navbar';

export function LandingPage(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-transparent">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <section className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="inline-flex rounded-full border border-border bg-white/80 px-4 py-2 text-sm text-text-secondary shadow-card backdrop-blur-sm">
              Built for students, graduates, and first-time job seekers
            </div>
            <h1 className="mt-6 max-w-2xl text-5xl font-semibold tracking-tight text-text-primary md:text-6xl">
              Close your skills gap with clear, actionable guidance.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-text-secondary md:text-xl">
              AI-powered job matching, gap analysis, and learning recommendations that help you move
              from searching to applying with confidence.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/register">
              <Button size="lg" variant="ai-gradient">
                Start matching jobs
              </Button>
            </Link>
            <Link to="/jobs">
              <Button variant="secondary" size="lg" className="shadow-card">
                Browse jobs
              </Button>
            </Link>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-card border border-border bg-white/80 p-4 shadow-card backdrop-blur-sm">
                <p className="text-2xl font-semibold text-text-primary">12k+</p>
                <p className="mt-1 text-sm text-text-secondary">job matches analyzed</p>
              </div>
              <div className="rounded-card border border-border bg-white/80 p-4 shadow-card backdrop-blur-sm">
                <p className="text-2xl font-semibold text-text-primary">89%</p>
                <p className="mt-1 text-sm text-text-secondary">users find skill gaps faster</p>
              </div>
              <div className="rounded-card border border-border bg-white/80 p-4 shadow-card backdrop-blur-sm">
                <p className="text-2xl font-semibold text-text-primary">24h</p>
                <p className="mt-1 text-sm text-text-secondary">to get a clear roadmap</p>
              </div>
            </div>
          </div>
          <div className="rounded-[28px] border border-border bg-white/85 p-6 shadow-card backdrop-blur-sm md:p-8">
            <div className="rounded-[24px] bg-gradient-to-br from-primary-light via-white to-ai-cyan/10 p-6 md:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-secondary">Recommended next step</p>
                  <h2 className="mt-1 text-2xl font-semibold text-text-primary">Frontend Engineer</h2>
                </div>
                <div className="rounded-full bg-white px-4 py-2 text-sm font-medium text-primary shadow-card">
                  88% match
                </div>
              </div>
              <div className="mt-6 space-y-4">
                <div className="rounded-card bg-white p-4 shadow-card">
                  <p className="text-sm text-text-secondary">Strong match areas</p>
                  <p className="mt-1 font-medium text-text-primary">React, TypeScript, UI systems</p>
                </div>
                <div className="rounded-card bg-white p-4 shadow-card">
                  <p className="text-sm text-text-secondary">Top gap to close</p>
                  <p className="mt-1 font-medium text-text-primary">Advanced TypeScript patterns</p>
                </div>
                <div className="rounded-card bg-white p-4 shadow-card">
                  <p className="text-sm text-text-secondary">Suggested path</p>
                  <p className="mt-1 font-medium text-text-primary">Course + project + interview practice</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}