import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Button, Badge, Card, ProgressBar, MatchScore, Avatar } from '@skillgap/ui';
import type { GapReport, Job } from '@skillgap/types';
import { Navbar } from '../components/Navbar';
import { api, hasAccessToken } from '../lib/api';
import { parseGapReport, parseJob } from '../lib/normalize';
import { formatJobSalary, formatPosted, jobTypeLabel } from '../lib/format';

const tabs = ['Overview', 'Requirements', 'Company', 'Gap Analysis'] as const;
type Tab = (typeof tabs)[number];

/**
 * Job detail page with tabbed content, match score sidebar, and apply drawer.
 */
export function JobDetailPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const [applyOpen, setApplyOpen] = useState(false);
  const [coverNote, setCoverNote] = useState('');

  const jobQuery = useQuery({
    queryKey: ['job', id],
    enabled: Boolean(id),
    queryFn: async (): Promise<Job> => {
      const res = await api.get<{ job: unknown }>(`/jobs/${id}`);
      return parseJob(res.data.job);
    },
  });

  const gapQuery = useQuery({
    queryKey: ['gap-preview', id],
    enabled: Boolean(id) && activeTab === 'Gap Analysis',
    queryFn: async (): Promise<GapReport> => {
      const res = await api.post<{ gapReport: unknown }>('/ai/gap-preview', { jobId: id });
      return parseGapReport(res.data.gapReport);
    },
  });

  const applyMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post<{ application: { id: string } }>('/applications', {
        jobId: id,
        ...(coverNote.trim() ? { coverNote: coverNote.trim() } : {}),
      });
      return res.data.application.id;
    },
    onSuccess: async (applicationId) => {
      await queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.success('Application submitted');
      setApplyOpen(false);
      navigate(`/applications/${applicationId}`);
    },
    onError: (err: unknown) => {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? String((err as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Apply failed')
          : 'Apply failed';
      toast.error(msg);
    },
  });

  const job = jobQuery.data;

  const openApply = () => {
    if (!hasAccessToken()) {
      navigate('/login', { state: { from: `/jobs/${id}` } });
      return;
    }
    setApplyOpen(true);
  };

  if (jobQuery.isError) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-6xl px-6 py-16 text-center">
          <p className="text-text-primary font-medium">Job not found</p>
          <Link to="/jobs" className="mt-4 inline-block text-primary">
            Back to jobs
          </Link>
        </main>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-6xl px-6 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-6 w-48 rounded bg-border" />
            <div className="h-10 w-3/4 rounded bg-border" />
            <div className="h-40 rounded-card bg-border/60" />
          </div>
        </main>
      </div>
    );
  }

  const match = typeof job.matchScore === 'number' ? job.matchScore : 0;
  const responsibilities = job.responsibilities ?? [];
  const gapReport = gapQuery.data;
  const gapBars =
    gapReport != null
      ? [...gapReport.criticalGaps, ...gapReport.partialMatches].slice(0, 8).map((g) => ({
          name: g.skillName,
          val: g.severity === 'CRITICAL' ? 32 : g.severity === 'MODERATE' ? 52 : 72,
        }))
      : [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-8 md:py-12">
        <nav className="flex items-center gap-2 text-sm text-text-secondary animate-fade-in-up">
          <Link to="/jobs" className="hover:text-primary transition-colors">
            Jobs
          </Link>
          <span>/</span>
          <span className="text-text-primary font-medium">{job.title}</span>
        </nav>

        <div className="mt-6 animate-fade-in-up delay-100">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-4">
              <Avatar name={job.company.name} size="lg" />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold text-text-primary md:text-3xl">{job.title}</h1>
                  {job.isVerified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary-light px-2.5 py-0.5 text-xs font-medium text-primary">
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
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-text-secondary">
                  <span className="font-medium text-primary">{job.company.name}</span>
                  <span>•</span>
                  <span>{job.location}</span>
                  <span>•</span>
                  <Badge variant="info">{jobTypeLabel(job.type)}</Badge>
                  <span>•</span>
                  <span className="font-semibold text-text-primary">{formatJobSalary(job)}</span>
                  <span>•</span>
                  <span>{formatPosted(job.postedAt)}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" size="sm" type="button">
                Save
              </Button>
              <Button type="button" onClick={openApply}>
                Apply Now
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-8 border-b border-border animate-fade-in-up delay-200">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px] animate-fade-in-up delay-300">
          <div>
            {activeTab === 'Overview' && (
              <Card className="p-6 md:p-8">
                <h2 className="text-lg font-semibold text-text-primary">About the role</h2>
                <p className="mt-3 text-text-secondary leading-relaxed whitespace-pre-wrap">{job.description}</p>
                {responsibilities.length > 0 && (
                  <>
                    <h3 className="mt-8 text-base font-semibold text-text-primary">Responsibilities</h3>
                    <ul className="mt-3 space-y-2.5">
                      {responsibilities.map((r) => (
                        <li key={r} className="flex items-start gap-2.5 text-sm text-text-secondary">
                          <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </Card>
            )}
            {activeTab === 'Requirements' && (
              <Card className="p-6 md:p-8">
                <h2 className="text-lg font-semibold text-text-primary">Requirements</h2>
                <ul className="mt-4 space-y-3">
                  {job.requirements.map((r) => (
                    <li key={r} className="flex items-start gap-2.5 text-sm text-text-secondary">
                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                      {r}
                    </li>
                  ))}
                </ul>
              </Card>
            )}
            {activeTab === 'Company' && (
              <Card className="p-6 md:p-8">
                <div className="flex items-center gap-4">
                  <Avatar name={job.company.name} size="lg" />
                  <div>
                    <h2 className="text-lg font-semibold text-text-primary">{job.company.name}</h2>
                    <p className="text-sm text-text-secondary">
                      {job.company.industry} • {job.company.size} employees
                    </p>
                  </div>
                </div>
                {job.company.website && (
                  <p className="mt-4 text-sm">
                    <a href={job.company.website} className="text-primary hover:underline" target="_blank" rel="noreferrer">
                      {job.company.website}
                    </a>
                  </p>
                )}
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  {[
                    { label: 'Industry', value: job.company.industry },
                    { label: 'Company size', value: job.company.size },
                    { label: 'Verification', value: job.company.isVerified ? 'Verified employer' : 'Unverified' },
                  ].map((d) => (
                    <div key={d.label} className="rounded-card border border-border p-3">
                      <p className="text-xs text-text-secondary">{d.label}</p>
                      <p className="mt-1 text-sm font-semibold text-text-primary">{d.value}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
            {activeTab === 'Gap Analysis' && (
              <Card className="p-6 md:p-8">
                <div className="mb-6 flex items-center gap-2">
                  <Badge variant="ai">AI Analysis</Badge>
                  <h2 className="text-lg font-semibold text-text-primary">Your Skill Match</h2>
                </div>
                {gapQuery.isLoading && <p className="text-sm text-text-secondary">Generating preview…</p>}
                {gapQuery.isError && (
                  <p className="text-sm text-error">Could not load gap preview. Try signing in for personalized results.</p>
                )}
                {!gapQuery.isLoading && gapBars.length > 0 && (
                  <div className="space-y-4">
                    {gapBars.map((s) => (
                      <div key={s.name}>
                        <div className="mb-1.5 flex items-center justify-between text-sm">
                          <span className="font-medium text-text-primary">{s.name}</span>
                          <span
                            className={`font-semibold ${s.val >= 70 ? 'text-success' : s.val >= 40 ? 'text-warning' : 'text-error'}`}
                          >
                            {s.val}%
                          </span>
                        </div>
                        <ProgressBar value={s.val} showPercent={false} />
                      </div>
                    ))}
                  </div>
                )}
                {!gapQuery.isLoading && gapReport && (
                  <p className="mt-4 text-sm text-text-secondary">
                    Overall alignment: <span className="font-semibold text-text-primary">{gapReport.overallMatchPercent}%</span>
                  </p>
                )}
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="p-6 text-center">
              <h3 className="text-sm font-semibold text-text-secondary">Your Match</h3>
              <div className="mt-4 flex justify-center">
                <MatchScore value={match} size={100} />
              </div>
              <p className="mt-3 text-sm text-text-secondary">
                You match about <span className="font-semibold text-text-primary">{match}%</span> of listed skills
              </p>
              <Button className="mt-6 w-full" type="button" onClick={openApply}>
                Apply Now
              </Button>
              <Button variant="secondary" className="mt-2 w-full" type="button">
                Save Job
              </Button>
            </Card>
            <Card className="p-6">
              <h3 className="mb-3 text-sm font-semibold text-text-primary">Required Skills</h3>
              <div className="flex flex-wrap gap-1.5">
                {job.skillsRequired.map((s) => (
                  <Badge key={s.id} variant="neutral">
                    {s.name}
                  </Badge>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>

      {applyOpen && (
        <>
          <div
            className="fixed inset-0 z-40 animate-fade-in bg-black/30 backdrop-blur-sm"
            onClick={() => setApplyOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md animate-slide-in-right bg-white shadow-elevated">
            <div className="flex h-full flex-col p-6 md:p-8">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-text-primary">Apply for this job</h2>
                <button
                  type="button"
                  onClick={() => setApplyOpen(false)}
                  className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-background"
                  aria-label="Close"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 space-y-6">
                <div className="rounded-card border-2 border-dashed border-border p-8 text-center">
                  <span className="text-3xl">📄</span>
                  <p className="mt-2 text-sm font-medium text-text-primary">Resume</p>
                  <p className="mt-1 text-xs text-text-secondary">Resume upload is coming soon — your profile skills are used for matching today.</p>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-primary" htmlFor="cover">
                    Cover note (optional)
                  </label>
                  <textarea
                    id="cover"
                    value={coverNote}
                    onChange={(e) => setCoverNote(e.target.value)}
                    className="min-h-[120px] w-full rounded-card border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary-light"
                    placeholder="Why are you a great fit for this role?"
                  />
                </div>
              </div>
              <Button
                variant="ai-gradient"
                className="mt-6 w-full"
                size="lg"
                type="button"
                disabled={applyMutation.isPending}
                onClick={() => applyMutation.mutate()}
              >
                {applyMutation.isPending ? 'Submitting…' : 'Confirm & Apply'}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
