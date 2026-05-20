import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Button, Badge, Card, ProgressBar, MatchScore, Avatar } from '@skillgap/ui';
import type { GapReport, Job } from '@skillgap/types';
import {
  ArrowLeft,
  Bookmark,
  Building2,
  MapPin,
  Clock,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  X,
  FileText,
} from 'lucide-react';
import { AppShell } from '../components/AppShell';
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
          ? String(
              (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
                'Apply failed',
            )
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
      <AppShell>
        <div className="p-4 lg:p-8 max-w-6xl mx-auto">
          <div className="py-16 text-center">
            <p className="text-text-primary font-medium">Job not found</p>
            <Link to="/jobs" className="mt-4 inline-block text-primary hover:text-primary-dark">
              <ArrowLeft className="h-4 w-4 inline mr-1" />
              Back to jobs
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!job) {
    return (
      <AppShell>
        <div className="p-4 lg:p-8 max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-6 w-48 rounded bg-border" />
            <div className="h-10 w-3/4 rounded bg-border" />
            <div className="h-40 rounded-card bg-border/60" />
          </div>
        </div>
      </AppShell>
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
    <AppShell>
      <div className="p-4 lg:p-8 max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-text-secondary animate-fade-in-up">
          <Link to="/jobs" className="hover:text-primary transition-colors flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Jobs
          </Link>
          <span>/</span>
          <span className="text-text-primary font-medium truncate">{job.title}</span>
        </nav>

        {/* Header */}
        <div className="mt-6 animate-fade-in-up delay-100">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-4">
              <Avatar name={job.company.name} size="lg" />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold text-text-primary md:text-3xl">{job.title}</h1>
                  {job.isVerified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary-light px-2.5 py-0.5 text-xs font-medium text-primary">
                      <CheckCircle2 className="h-3 w-3" />
                      Verified
                    </span>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-text-secondary">
                  <span className="flex items-center gap-1 font-medium text-primary">
                    <Building2 className="h-3.5 w-3.5" />
                    {job.company.name}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {job.location}
                  </span>
                  <Badge variant="info">{jobTypeLabel(job.type)}</Badge>
                  <span className="font-semibold text-text-primary">{formatJobSalary(job)}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {formatPosted(job.postedAt)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" size="sm" type="button">
                <Bookmark className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button type="button" onClick={openApply}>
                Apply Now
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-8 border-b border-border animate-fade-in-up delay-200">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                {tab === 'Gap Analysis' && <Sparkles className="h-4 w-4 inline mr-1" />}
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content Grid */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px] animate-fade-in-up delay-300">
          <div>
            {activeTab === 'Overview' && (
              <Card className="p-6 md:p-8">
                <h2 className="text-lg font-semibold text-text-primary">About the role</h2>
                <p className="mt-3 text-text-secondary leading-relaxed whitespace-pre-wrap">
                  {job.description}
                </p>
                {responsibilities.length > 0 && (
                  <>
                    <h3 className="mt-8 text-base font-semibold text-text-primary">
                      Responsibilities
                    </h3>
                    <ul className="mt-3 space-y-2.5">
                      {responsibilities.map((r) => (
                        <li
                          key={r}
                          className="flex items-start gap-2.5 text-sm text-text-secondary"
                        >
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
                      <CheckCircle2 className="h-4 w-4 mt-0.5 text-success flex-shrink-0" />
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
                      {job.company.industry} - {job.company.size} employees
                    </p>
                  </div>
                </div>
                {job.company.website && (
                  <a
                    href={job.company.website}
                    className="mt-4 inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                    {job.company.website}
                  </a>
                )}
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  {[
                    { label: 'Industry', value: job.company.industry },
                    { label: 'Company size', value: job.company.size },
                    {
                      label: 'Verification',
                      value: job.company.isVerified ? 'Verified employer' : 'Unverified',
                    },
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
                  <Badge variant="ai">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI Analysis
                  </Badge>
                  <h2 className="text-lg font-semibold text-text-primary">Your Skill Match</h2>
                </div>
                {gapQuery.isLoading && (
                  <p className="text-sm text-text-secondary">Generating preview...</p>
                )}
                {gapQuery.isError && (
                  <p className="text-sm text-error">
                    Could not load gap preview. Try signing in for personalized results.
                  </p>
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
                    Overall alignment:{' '}
                    <span className="font-semibold text-text-primary">
                      {gapReport.overallMatchPercent}%
                    </span>
                  </p>
                )}
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-6 text-center">
              <h3 className="text-sm font-semibold text-text-secondary">Your Match</h3>
              <div className="mt-4 flex justify-center">
                <MatchScore value={match} size={100} />
              </div>
              <p className="mt-3 text-sm text-text-secondary">
                You match about <span className="font-semibold text-text-primary">{match}%</span> of
                listed skills
              </p>
              <Button className="mt-6 w-full" type="button" onClick={openApply}>
                Apply Now
              </Button>
              <Button variant="secondary" className="mt-2 w-full" type="button">
                <Bookmark className="h-4 w-4 mr-1" />
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
      </div>

      {/* Apply Drawer */}
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
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 space-y-6">
                <div className="rounded-card border-2 border-dashed border-border p-8 text-center">
                  <FileText className="h-8 w-8 text-text-secondary mx-auto mb-2" />
                  <p className="text-sm font-medium text-text-primary">Resume</p>
                  <p className="mt-1 text-xs text-text-secondary">
                    Resume upload is coming soon - your profile skills are used for matching today.
                  </p>
                </div>
                <div>
                  <label
                    className="mb-1.5 block text-sm font-medium text-text-primary"
                    htmlFor="cover"
                  >
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
                {applyMutation.isPending ? 'Submitting...' : 'Confirm & Apply'}
              </Button>
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}
