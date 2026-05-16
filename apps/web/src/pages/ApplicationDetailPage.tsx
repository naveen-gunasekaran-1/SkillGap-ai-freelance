import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button, Badge, Card, ProgressBar, MatchScore, Avatar } from '@skillgap/ui';
import type { Application } from '@skillgap/types';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  Building2, 
  MapPin, 
  Sparkles, 
  BookOpen, 
  ExternalLink,
  AlertTriangle,
  AlertCircle,
} from 'lucide-react';
import { AppShell } from '../components/AppShell';
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
      <AppShell>
        <div className="p-4 lg:p-8 max-w-4xl mx-auto">
          <div className="py-16 text-center">
            <p className="font-medium text-text-primary">Application not found</p>
            <Link to="/applications" className="mt-4 inline-flex items-center gap-1 text-primary hover:text-primary-dark">
              <ArrowLeft className="h-4 w-4" />
              Back to applications
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!app || !job) {
    return (
      <AppShell>
        <div className="p-4 lg:p-8 max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-6 w-40 rounded bg-border" />
            <div className="h-32 rounded-card bg-border/70" />
          </div>
        </div>
      </AppShell>
    );
  }

  const gapExplanation = app.aiExplanations?.find((e) => e.type === 'GAP_REPORT');
  const rejectionExplanation = app.aiExplanations?.find((e) => e.type === 'REJECTION_REASON');
  const gapItems = gapExplanation
    ? [...gapExplanation.missingSkills, ...gapExplanation.weakEvidence]
    : [...(app.gapReport?.criticalGaps ?? []), ...(app.gapReport?.partialMatches ?? [])];
  const recommendations = gapExplanation?.recommendations ?? app.gapReport?.recommendations ?? [];
  const strengths = gapExplanation?.strengths ?? app.gapReport?.strengths ?? [];

  return (
    <AppShell>
      <div className="p-4 lg:p-8 max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex animate-fade-in-up items-center gap-2 text-sm text-text-secondary">
          <Link to="/applications" className="flex items-center gap-1 transition-colors hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            Applications
          </Link>
          <span>/</span>
          <span className="font-medium text-text-primary truncate">{job.title}</span>
        </nav>

        {/* Header Card */}
        <Card className="mt-6 animate-fade-in-up delay-100 overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div className="flex items-start gap-4">
                <Avatar name={job.company.name} size="lg" />
                <div>
                  <h1 className="text-2xl font-bold text-text-primary md:text-3xl">{job.title}</h1>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-text-secondary">
                    <span className="flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      {job.company.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {job.location}
                    </span>
                  </div>
                </div>
              </div>
              <Badge variant={variant} className="self-start px-4 py-1.5 text-sm">
                {label}
              </Badge>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-4">
              {[
                { label: 'Applied', value: formatFull(app.appliedAt), icon: <Clock className="h-4 w-4" /> },
                { label: 'Last update', value: formatPosted(app.updatedAt), icon: <CheckCircle2 className="h-4 w-4" /> },
                { label: 'Match score', value: `${app.matchScore}%`, icon: <Sparkles className="h-4 w-4" /> },
                { label: 'Status', value: label, icon: <AlertCircle className="h-4 w-4" /> },
              ].map((d) => (
                <div key={d.label} className="rounded-xl border border-border bg-background/50 p-4">
                  <div className="flex items-center gap-2 text-text-secondary mb-1">
                    {d.icon}
                    <span className="text-xs">{d.label}</span>
                  </div>
                  <p className="text-sm font-semibold text-text-primary">{d.value}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Main Content Grid */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Timeline */}
            <Card className="animate-fade-in-up delay-200 p-6">
              <h2 className="mb-6 text-lg font-semibold text-text-primary">Application Timeline</h2>
              <div className="relative">
                {[
                  { label: 'Application submitted', time: formatFull(app.appliedAt), done: true },
                  { label: 'Latest update', time: formatFull(app.updatedAt), done: true, active: true },
                ].map((step, i, arr) => (
                  <div key={step.label} className="relative flex gap-4 pb-8 last:pb-0">
                    {i < arr.length - 1 && <div className="absolute left-[11px] top-6 h-full w-0.5 bg-primary" />}
                    <div
                      className={`relative z-10 mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${
                        step.active ? 'bg-primary' : 'bg-primary'
                      }`}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-text-primary">{step.label}</p>
                      <p className="text-sm text-text-secondary">{step.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {(app.rejectionReason || rejectionExplanation) && (
              <Card className="animate-fade-in-up delay-300 p-6">
                <div className="mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-error" />
                  <h2 className="text-lg font-semibold text-text-primary">Decision Explanation</h2>
                </div>
                <div className="rounded-xl border border-error/20 bg-error/5 p-4">
                  <p className="text-sm leading-relaxed text-text-primary">
                    {rejectionExplanation?.summary ?? app.rejectionReason}
                  </p>
                  {rejectionExplanation && (
                    <p className="mt-3 text-xs text-text-secondary">
                      Recorded as {rejectionExplanation.promptVersion} - {formatFull(rejectionExplanation.createdAt)}
                    </p>
                  )}
                </div>
              </Card>
            )}

            {/* Gap Analysis */}
            {gapItems.length > 0 && (
              <Card className="animate-fade-in-up delay-400 p-6">
                <div className="mb-6 flex items-center gap-2">
                  <Badge variant="ai">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI Generated
                  </Badge>
                  <h2 className="text-lg font-semibold text-text-primary">Gap Analysis Report</h2>
                </div>

                {gapExplanation && (
                  <div className="mb-6 rounded-xl border border-ai-purple/20 bg-primary-light/40 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-medium text-text-primary">{gapExplanation.summary}</p>
                        <p className="mt-1 text-xs text-text-secondary">
                          Generated by {gapExplanation.generatedBy} using {gapExplanation.model}
                        </p>
                      </div>
                      <Badge variant="ai" className="self-start">
                        {gapExplanation.confidence}% confidence
                      </Badge>
                    </div>
                    <p className="mt-3 text-xs text-text-secondary">
                      Prompt {gapExplanation.promptVersion} - {formatFull(gapExplanation.createdAt)}
                    </p>
                  </div>
                )}
                
                {/* Strengths */}
                {strengths.length > 0 && (
                  <div className="mb-6 rounded-xl border border-success/20 bg-success/5 p-4">
                    <h3 className="font-medium text-text-primary mb-2 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      Your Strengths
                    </h3>
                    <ul className="space-y-1">
                      {strengths.slice(0, 3).map((s) => (
                        <li key={s} className="text-sm text-text-secondary flex items-start gap-2">
                          <span className="text-success mt-1">+</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Gaps */}
                <div className="space-y-4">
                  {gapItems.map((g) => (
                    <div
                      key={g.skillName}
                      className={`rounded-xl border p-5 ${
                        g.severity === 'CRITICAL' ? 'border-error/20 bg-error/5' : g.severity === 'MODERATE' ? 'border-warning/20 bg-warning/5' : 'border-border bg-background/50'
                      }`}
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="font-semibold text-text-primary flex items-center gap-2">
                          {g.severity === 'CRITICAL' ? (
                            <AlertTriangle className="h-4 w-4 text-error" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-warning" />
                          )}
                          {g.skillName}
                        </h3>
                        <Badge variant={g.severity === 'CRITICAL' ? 'error' : g.severity === 'MODERATE' ? 'warning' : 'neutral'}>
                          {g.severity}
                        </Badge>
                      </div>
                      <div className="mb-3 grid gap-2 text-sm sm:grid-cols-2">
                        <div className="rounded-lg bg-white/50 p-2">
                          <span className="text-text-secondary text-xs">Required: </span>
                          <span className="text-text-primary font-medium">{g.required}</span>
                        </div>
                        <div className="rounded-lg bg-white/50 p-2">
                          <span className="text-text-secondary text-xs">You have: </span>
                          <span className="text-text-primary font-medium">{g.candidate}</span>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed text-text-secondary">{g.explanation}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Learning Recommendations */}
            {recommendations.length > 0 && (
              <Card className="animate-fade-in-up delay-500 p-6">
                <div className="mb-6 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold text-text-primary">Recommended Learning</h2>
                </div>
                <div className="space-y-3">
                  {recommendations.map((r) => (
                    <div
                      key={`${r.skillName}-${r.resourceTitle}`}
                      className="hover-lift flex items-center justify-between rounded-xl border border-border p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light">
                          <BookOpen className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-primary">{r.resourceTitle}</p>
                          <p className="text-xs text-text-secondary">
                            {r.platform} - {r.estimatedHours}h - {r.isFree ? 'Free' : 'Paid'}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" type="button">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Start
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Match Score */}
            <Card className="p-6 text-center animate-fade-in-up delay-200">
              <h3 className="text-sm font-semibold text-text-secondary mb-4">Your Match Score</h3>
              <div className="flex justify-center">
                <MatchScore value={app.matchScore} size={100} />
              </div>
              <p className="mt-4 text-sm text-text-secondary">
                You matched <span className="font-semibold text-text-primary">{app.matchScore}%</span> of the requirements
              </p>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6 animate-fade-in-up delay-300">
              <h3 className="text-sm font-semibold text-text-primary mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link to={`/jobs/${job.id}`}>
                  <Button variant="secondary" className="w-full">
                    View Job Posting
                  </Button>
                </Link>
                <Button variant="ghost" className="w-full">
                  Withdraw Application
                </Button>
              </div>
            </Card>

            {/* Job Skills */}
            <Card className="p-6 animate-fade-in-up delay-400">
              <h3 className="text-sm font-semibold text-text-primary mb-4">Required Skills</h3>
              <div className="flex flex-wrap gap-1.5">
                {job.skillsRequired?.map((s) => (
                  <Badge key={s.id} variant="neutral">
                    {s.name}
                  </Badge>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
