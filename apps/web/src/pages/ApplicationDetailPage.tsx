import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button, Badge, Card } from '@skillgap/ui';
import type { Application } from '@skillgap/types';
import { Navbar } from '../components/Navbar';
import { api } from '../lib/api';
import { parseApplication } from '../lib/normalize';
import { applicationStatusPresentation, formatPosted } from '../lib/format';

/**
 * Application detail with timeline, gap report, and learning recommendations.
 */
export function ApplicationDetailPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();

  const appQuery = useQuery({
    queryKey: ['application', id],
    enabled: Boolean(id),
    queryFn: async (): Promise<Application> => {
      const res = await api.get<{ application: unknown }>(`/applications/${id}`);
      return parseApplication(res.data.application);
    },
  });

  const app = appQuery.data;
  const job = app?.job;
  const { label, variant } = app ? applicationStatusPresentation(app.status) : { label: '', variant: 'neutral' as const };

  const formatFull = (d: Date) =>
    d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

  if (appQuery.isError || (!appQuery.isLoading && !app)) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-4xl px-6 py-16 text-center">
          <p className="font-medium text-text-primary">Application not found</p>
          <Link to="/applications" className="mt-4 inline-block text-primary">
            Back to applications
          </Link>
        </main>
      </div>
    );
  }

  if (!app || !job) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-4xl px-6 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-6 w-40 rounded bg-border" />
            <div className="h-32 rounded-card bg-border/70" />
          </div>
        </main>
      </div>
    );
  }

  const gapItems = [
    ...(app.gapReport?.criticalGaps ?? []),
    ...(app.gapReport?.partialMatches ?? []),
  ];
  const recommendations = app.gapReport?.recommendations ?? [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-8 md:py-12">
        <nav className="flex animate-fade-in-up items-center gap-2 text-sm text-text-secondary">
          <Link to="/applications" className="transition-colors hover:text-primary">
            Applications
          </Link>
          <span>/</span>
          <span className="font-medium text-text-primary">{job.title}</span>
        </nav>

        <Card className="mt-6 animate-fade-in-up delay-100 p-6 md:p-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div>
              <h1 className="text-2xl font-bold text-text-primary md:text-3xl">{job.title}</h1>
              <p className="mt-2 text-text-secondary">
                {job.company.name} • {job.location}
              </p>
            </div>
            <Badge variant={variant} className="self-start px-4 py-1.5 text-sm">
              {label}
            </Badge>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-4">
            {[
              { label: 'Applied', value: formatFull(app.appliedAt) },
              { label: 'Last update', value: formatPosted(app.updatedAt) },
              { label: 'Match score', value: `${app.matchScore}%` },
              { label: 'Status', value: label },
            ].map((d) => (
              <div key={d.label} className="rounded-card border border-border bg-background/50 p-3">
                <p className="text-xs text-text-secondary">{d.label}</p>
                <p className="mt-1 text-sm font-semibold text-text-primary">{d.value}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="mt-6 animate-fade-in-up delay-200 p-6 md:p-8">
          <h2 className="mb-6 text-lg font-semibold text-text-primary">Application Timeline</h2>
          <div className="relative">
            {[
              { label: 'Application submitted', time: formatFull(app.appliedAt), done: true },
              { label: 'Latest update', time: formatFull(app.updatedAt), done: true, active: true },
            ].map((step, i, arr) => (
              <div key={step.label} className="relative flex gap-4 pb-8 last:pb-0">
                {i < arr.length - 1 && <div className="absolute left-[11px] top-6 h-full w-0.5 bg-primary" />}
                <div
                  className={`relative z-10 mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                    step.active ? 'border-primary bg-primary' : 'border-primary bg-primary'
                  }`}
                >
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-text-primary">{step.label}</p>
                  <p className="text-sm text-text-secondary">{step.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {gapItems.length > 0 && (
          <Card className="mt-6 animate-fade-in-up delay-300 p-6 md:p-8">
            <div className="mb-6 flex items-center gap-2">
              <Badge variant="ai">AI Generated</Badge>
              <h2 className="text-lg font-semibold text-text-primary">Gap Analysis Report</h2>
            </div>
            <div className="space-y-4">
              {gapItems.map((g) => (
                <div
                  key={g.skillName}
                  className={`rounded-card border p-5 ${
                    g.severity === 'CRITICAL' ? 'border-error/20 bg-error/5' : 'border-warning/20 bg-warning/5'
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-semibold text-text-primary">{g.skillName}</h3>
                    <Badge variant={g.severity === 'CRITICAL' ? 'error' : 'warning'}>{g.severity}</Badge>
                  </div>
                  <div className="mb-3 grid gap-2 text-sm sm:grid-cols-2">
                    <div>
                      <span className="text-text-secondary">Required: </span>
                      <span className="text-text-primary">{g.required}</span>
                    </div>
                    <div>
                      <span className="text-text-secondary">You have: </span>
                      <span className="text-text-primary">{g.candidate}</span>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-text-secondary">{g.explanation}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {recommendations.length > 0 && (
          <Card className="mt-6 animate-fade-in-up delay-400 p-6 md:p-8">
            <div className="mb-6 flex items-center gap-2">
              <span className="text-lg">📚</span>
              <h2 className="text-lg font-semibold text-text-primary">Recommended Learning</h2>
            </div>
            <div className="space-y-3">
              {recommendations.map((r) => (
                <div
                  key={`${r.skillName}-${r.resourceTitle}`}
                  className="hover-lift flex items-center justify-between rounded-card border border-border p-4"
                >
                  <div>
                    <p className="text-sm font-medium text-text-primary">{r.resourceTitle}</p>
                    <p className="text-xs text-text-secondary">
                      {r.platform} • {r.estimatedHours}h • {r.isFree ? 'Free' : 'Paid'}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" type="button">
                    Start →
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}

        <div className="mt-6 flex animate-fade-in-up delay-500 gap-3">
          <Link to={`/jobs/${job.id}`}>
            <Button type="button">View Job</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
