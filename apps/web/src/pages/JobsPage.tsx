import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MatchScore, Badge, Button, Input, Skeleton, Avatar, Card } from '@skillgap/ui';
import type { Job } from '@skillgap/types';
import { Navbar } from '../components/Navbar';
import { api } from '../lib/api';
import { parseJob } from '../lib/normalize';
import { formatJobSalary, formatPosted, jobTypeLabel } from '../lib/format';

const typeLabels: Record<string, string> = {
  FULL_TIME: 'Full Time',
  PART_TIME: 'Part Time',
  INTERNSHIP: 'Internship',
  CONTRACT: 'Contract',
};
const typeColors: Record<string, string> = {
  FULL_TIME: 'bg-primary-light text-primary',
  PART_TIME: 'bg-success/10 text-success',
  INTERNSHIP: 'bg-warning/10 text-warning',
  CONTRACT: 'bg-ai-purple/10 text-ai-purple',
};
const jobTypes = ['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT'];

/**
 * Job discovery page with filter sidebar, job cards, and featured companies (API-backed).
 */
export function JobsPage(): React.JSX.Element {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(t);
  }, [search]);

  const jobsQuery = useQuery({
    queryKey: ['jobs', debouncedSearch, selectedTypes, verifiedOnly],
    queryFn: async (): Promise<Job[]> => {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (selectedTypes.length > 0) params.set('type', selectedTypes.join(','));
      if (verifiedOnly) params.set('verified', 'true');
      const qs = params.toString();
      const res = await api.get<{ jobs: unknown[] }>(qs ? `/jobs?${qs}` : '/jobs');
      return res.data.jobs.map(parseJob);
    },
  });

  const companiesQuery = useQuery({
    queryKey: ['companies', 'featured'],
    queryFn: async () => {
      const res = await api.get<{ companies: { name: string; openJobs: number }[] }>('/companies/featured');
      return res.data.companies;
    },
  });

  const toggleType = (t: string) =>
    setSelectedTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const jobs = jobsQuery.data ?? [];
  const isLoading = jobsQuery.isLoading;

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-3">Job Type</h3>
        <div className="space-y-2">
          {jobTypes.map((t) => (
            <label key={t} className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedTypes.includes(t)}
                onChange={() => toggleType(t)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm text-text-secondary">{typeLabels[t]}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="border-t border-border pt-6">
        <h3 className="text-sm font-semibold text-text-primary mb-3">Verification</h3>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <button
            type="button"
            onClick={() => setVerifiedOnly(!verifiedOnly)}
            className={`relative h-5 w-9 rounded-full transition-colors duration-200 ${
              verifiedOnly ? 'bg-primary' : 'bg-border'
            }`}
            aria-pressed={verifiedOnly}
            aria-label="Toggle verified only"
          >
            <span
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
                verifiedOnly ? 'translate-x-4' : 'translate-x-0.5'
              }`}
            />
          </button>
          <span className="text-sm text-text-secondary">Verified only</span>
        </label>
      </div>
      {(selectedTypes.length > 0 || verifiedOnly) && (
        <button
          type="button"
          onClick={() => {
            setSelectedTypes([]);
            setVerifiedOnly(false);
          }}
          className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
        >
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 py-8 md:py-12">
        <div className="animate-fade-in-up">
          <h1 className="text-2xl font-bold text-text-primary md:text-3xl">Job Opportunities</h1>
          <p className="mt-2 text-text-secondary">Personalized job matches based on your skills</p>
        </div>

        <div className="mt-6 flex gap-3 animate-fade-in-up delay-100">
          <div className="relative flex-1">
            <svg
              className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <Input
              type="text"
              placeholder="Search jobs, companies, or skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="secondary" className="lg:hidden" onClick={() => setShowFilters(!showFilters)}>
            Filters
          </Button>
        </div>

        {showFilters && (
          <div className="mt-4 rounded-card border border-border bg-white p-6 shadow-card lg:hidden animate-slide-down">
            <FilterPanel />
          </div>
        )}

        {jobsQuery.isError && (
          <p className="mt-4 text-sm text-error">Could not load jobs. Is the API running?</p>
        )}

        <p className="mt-4 text-sm text-text-secondary animate-fade-in-up delay-200">
          {isLoading ? 'Loading jobs…' : `${jobs.length} ${jobs.length === 1 ? 'job' : 'jobs'} found`}
        </p>

        <div className="mt-6 grid gap-8 lg:grid-cols-[240px_1fr_240px]">
          <aside className="hidden lg:block">
            <Card className="sticky top-24 p-6">
              <h2 className="text-base font-semibold text-text-primary mb-5">Filters</h2>
              <FilterPanel />
            </Card>
          </aside>

          <div className="space-y-4">
            {isLoading &&
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="p-5">
                  <div className="flex gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-full max-w-[66%]" />
                      <Skeleton className="h-3 w-full max-w-[50%]" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                </Card>
              ))}

            {!isLoading &&
              jobs.map((job, i) => {
                const skillNames = job.skillsRequired.map((s) => s.name);
                const match = typeof job.matchScore === 'number' ? job.matchScore : 0;
                return (
                  <Link
                    key={job.id}
                    to={`/jobs/${job.id}`}
                    className="block animate-fade-in-up"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <Card hover className="p-5 transition-all duration-200">
                      <div className="flex items-start gap-4">
                        <Avatar name={job.company.name} size="md" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-base font-semibold text-text-primary">{job.title}</h2>
                            {job.isVerified && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-primary-light px-2 py-0.5 text-xs font-medium text-primary">
                                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path
                                    fillRule="evenodd"
                                    d="M16.403 12.652a3 3 0 0 0 0-5.304 3 3 0 0 0-3.75-3.751 3 3 0 0 0-5.305 0 3 3 0 0 0-3.751 3.75 3 3 0 0 0 0 5.305 3 3 0 0 0 3.75 3.751 3 3 0 0 0 5.305 0 3 3 0 0 0 3.751-3.75Zm-2.546-4.46a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                Verified
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-text-secondary">
                            {job.company.name} • {job.location} • {formatPosted(job.postedAt)}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${typeColors[job.type]}`}>
                              {jobTypeLabel(job.type)}
                            </span>
                            {skillNames.slice(0, 4).map((s) => (
                              <Badge key={s} variant="neutral">
                                {s}
                              </Badge>
                            ))}
                            {skillNames.length > 4 && <Badge variant="neutral">+{skillNames.length - 4} more</Badge>}
                          </div>
                          <p className="mt-2.5 text-sm font-semibold text-primary">{formatJobSalary(job)}</p>
                        </div>
                        <div className="hidden sm:block flex-shrink-0">
                          <MatchScore value={match} size={56} />
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}

            {!isLoading && jobs.length === 0 && (
              <div className="py-20 text-center">
                <span className="text-4xl">🔍</span>
                <p className="mt-4 text-lg font-medium text-text-primary">No jobs found</p>
                <p className="mt-2 text-sm text-text-secondary">Try adjusting your filters or search query</p>
              </div>
            )}
          </div>

          <aside className="hidden lg:block">
            <Card className="sticky top-24 p-6">
              <h2 className="text-base font-semibold text-text-primary mb-4">Featured Companies</h2>
              <div className="space-y-4">
                {(companiesQuery.data ?? []).map((c) => (
                  <div key={c.name} className="flex items-center gap-3">
                    <Avatar name={c.name} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-text-primary">{c.name}</p>
                      <p className="text-xs text-text-secondary">{c.openJobs} open positions</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
}
