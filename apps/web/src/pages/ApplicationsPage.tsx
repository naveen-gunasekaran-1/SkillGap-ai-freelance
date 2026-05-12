import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Badge, Card, MatchScore, Avatar } from '@skillgap/ui';
import type { Application, ApplicationStatus } from '@skillgap/types';
import { Navbar } from '../components/Navbar';
import { api } from '../lib/api';
import { parseApplication } from '../lib/normalize';
import { applicationStatusPresentation } from '../lib/format';

const statusFilters = ['All', 'Reviewing', 'Interview', 'Offer', 'Rejected'] as const;
type StatusFilter = (typeof statusFilters)[number];

function statusGroup(status: ApplicationStatus, filter: StatusFilter): boolean {
  if (filter === 'All') return true;
  if (filter === 'Reviewing') {
    return status === 'APPLIED' || status === 'UNDER_REVIEW' || status === 'SHORTLISTED';
  }
  if (filter === 'Interview') {
    return status === 'INTERVIEW_SCHEDULED' || status === 'INTERVIEW_DONE';
  }
  if (filter === 'Offer') {
    return status === 'OFFER_EXTENDED' || status === 'HIRED';
  }
  if (filter === 'Rejected') {
    return status === 'REJECTED';
  }
  return true;
}

/**
 * Applications tracker with status filters and API-backed cards.
 */
export function ApplicationsPage(): React.JSX.Element {
  const [filter, setFilter] = useState<StatusFilter>('All');
  const [sort, setSort] = useState<'date' | 'score'>('date');

  const appsQuery = useQuery({
    queryKey: ['applications'],
    queryFn: async (): Promise<Application[]> => {
      const res = await api.get<{ applications: unknown[] }>('/applications');
      return res.data.applications.map(parseApplication);
    },
  });

  const apps = appsQuery.data ?? [];

  const filtered = useMemo(() => {
    const list = apps.filter((a) => statusGroup(a.status, filter));
    if (sort === 'score') {
      return [...list].sort((a, b) => b.matchScore - a.matchScore);
    }
    return [...list].sort((a, b) => b.appliedAt.getTime() - a.appliedAt.getTime());
  }, [apps, filter, sort]);

  const formatDate = (d: Date) =>
    d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-8 md:py-12">
        <div className="animate-fade-in-up">
          <h1 className="text-2xl font-bold text-text-primary md:text-3xl">Your Applications</h1>
          <p className="mt-2 text-text-secondary">Track your job applications, interviews, and outcomes</p>
        </div>

        {appsQuery.isError && (
          <p className="mt-4 text-sm text-error">Could not load applications.</p>
        )}

        <div className="mt-6 flex animate-fade-in-up delay-100 flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex w-full gap-1 overflow-x-auto rounded-xl border border-border bg-white p-1 shadow-card sm:w-auto">
            {statusFilters.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFilter(s)}
                className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150 ${
                  filter === s ? 'bg-primary text-white shadow-card' : 'text-text-secondary hover:bg-background hover:text-text-primary'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as 'date' | 'score')}
            className="hidden rounded-card border border-border bg-white px-3 py-2 text-sm text-text-primary outline-none focus:border-primary sm:block"
            aria-label="Sort applications"
          >
            <option value="date">Sort by date</option>
            <option value="score">Sort by match</option>
          </select>
        </div>

        <div className="mt-6 space-y-3">
          {appsQuery.isLoading &&
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-5">
                <div className="h-16 animate-pulse rounded bg-border/70" />
              </Card>
            ))}

          {!appsQuery.isLoading &&
            filtered.map((app, i) => {
              const job = app.job;
              const title = job?.title ?? 'Job';
              const company = job?.company.name ?? 'Company';
              const { label, variant } = applicationStatusPresentation(app.status);
              return (
                <Link
                  key={app.id}
                  to={`/applications/${app.id}`}
                  className="block animate-fade-in-up"
                  style={{ animationDelay: `${i * 60 + 150}ms` }}
                >
                  <Card hover className="p-5">
                    <div className="flex items-center gap-4">
                      <Avatar name={company} size="md" />
                      <div className="min-w-0 flex-1">
                        <h2 className="truncate font-semibold text-text-primary">{title}</h2>
                        <p className="mt-1 text-sm text-text-secondary">
                          {company} • Applied {formatDate(app.appliedAt)}
                        </p>
                      </div>
                      <div className="hidden items-center gap-3 sm:flex">
                        <Badge variant={variant}>{label}</Badge>
                        <MatchScore value={app.matchScore} size={44} />
                      </div>
                      <div className="sm:hidden">
                        <Badge variant={variant}>{label}</Badge>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}

          {!appsQuery.isLoading && filtered.length === 0 && (
            <div className="py-20 text-center">
              <span className="text-4xl">📋</span>
              <p className="mt-4 text-lg font-medium text-text-primary">No applications found</p>
              <p className="mt-2 text-sm text-text-secondary">Try changing the filter or apply to more jobs</p>
              <Link to="/jobs" className="mt-6 inline-block text-primary font-semibold">
                Browse jobs
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
