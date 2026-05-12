import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MatchScore, ProgressBar, Card, Badge, Button, Avatar } from '@skillgap/ui';
import type { Application } from '@skillgap/types';
import { Navbar } from '../components/Navbar';
import { api } from '../lib/api';
import { parseApplication } from '../lib/normalize';
import { applicationStatusPresentation } from '../lib/format';
import { useAuthStore } from '../stores/authStore';

const quickActions = [
  { icon: '🔍', title: 'Browse Jobs', desc: 'Find new opportunities', to: '/jobs', color: 'bg-primary-light' },
  { icon: '📄', title: 'Your Profile', desc: 'Update skills & details', to: '/profile', color: 'bg-success/10' },
  { icon: '📊', title: 'View Reports', desc: 'Gap analysis results', to: '/applications', color: 'bg-ai-purple/10' },
];

/**
 * Candidate dashboard backed by live applications data.
 */
export function DashboardPage(): React.JSX.Element {
  const user = useAuthStore((s) => s.user);

  const appsQuery = useQuery({
    queryKey: ['applications'],
    queryFn: async (): Promise<Application[]> => {
      const res = await api.get<{ applications: unknown[] }>('/applications');
      return res.data.applications.map(parseApplication);
    },
  });

  const apps = appsQuery.data ?? [];
  const recentApps = apps.slice(0, 3);
  const avgMatch =
    apps.length > 0 ? Math.round(apps.reduce((s, a) => s + a.matchScore, 0) / apps.length) : 0;

  const primaryGapReport = apps.find((a) => a.gapReport)?.gapReport;
  const gaps =
    primaryGapReport?.criticalGaps.slice(0, 3).map((g, idx) => ({
      skill: g.skillName,
      jobs: 3 + idx,
      severity: g.severity,
      priority: g.severity === 'CRITICAL' ? 'High' : g.severity === 'MODERATE' ? 'Medium' : 'Low',
    })) ?? [];

  const recommendations =
    primaryGapReport?.recommendations.slice(0, 3).map((r) => ({
      title: r.resourceTitle,
      platform: r.platform,
      hours: r.estimatedHours,
      free: r.isFree,
      icon: '📘',
    })) ?? [];

  const displayName = user?.name ?? 'there';

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 py-8 md:py-12">
        <div className="flex animate-fade-in-up flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex items-center gap-4">
            <Avatar name={displayName} size="lg" />
            <div>
              <h1 className="text-2xl font-bold text-text-primary md:text-3xl">Welcome back, {displayName} 👋</h1>
              <p className="mt-1 text-text-secondary">Here&apos;s your career progress at a glance.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm text-text-secondary shadow-card">
            <span className="h-2 w-2 animate-pulse rounded-full bg-success" />
            {appsQuery.isFetching ? 'Syncing…' : 'Profile in sync'}
          </div>
        </div>

        <div className="mt-8 grid animate-fade-in-up delay-100 gap-4 sm:grid-cols-3">
          {quickActions.map((a) => (
            <Link key={a.title} to={a.to}>
              <Card hover className="flex items-center gap-4 p-5">
                <span className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl ${a.color}`}>{a.icon}</span>
                <div>
                  <p className="font-semibold text-text-primary">{a.title}</p>
                  <p className="text-sm text-text-secondary">{a.desc}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {appsQuery.isError && (
          <p className="mt-6 text-sm text-error">Could not load your applications. Try refreshing.</p>
        )}

        <div className="mt-8 grid animate-fade-in-up delay-200 gap-6 lg:grid-cols-3">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-text-secondary">Overall Match Score</h2>
              <Badge variant="ai">AI Powered</Badge>
            </div>
            <div className="mt-4 flex items-center justify-center">
              <MatchScore value={avgMatch} size={120} />
            </div>
            <p className="mt-4 text-center text-sm text-text-secondary">
              Avg match across <span className="font-semibold text-text-primary">{apps.length}</span> tracked applications
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="text-sm font-medium text-text-secondary">Skills Progress</h2>
            <div className="mt-5 space-y-4">
              {(user?.skills?.length ? user.skills : ['React', 'TypeScript', 'Node.js', 'CSS']).slice(0, 4).map((skill, idx) => {
                const val = [92, 78, 65, 85][idx] ?? 70;
                return (
                  <div key={skill}>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-text-primary">{skill}</span>
                      <span className="text-text-secondary">{val}%</span>
                    </div>
                    <ProgressBar value={val} showPercent={false} />
                  </div>
                );
              })}
            </div>
          </Card>

          <div className="relative overflow-hidden rounded-card border border-ai-purple/20 bg-gradient-to-br from-ai-purple/5 to-ai-cyan/5 p-6 shadow-card">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-ai-purple/10 blur-2xl" />
            <div className="mb-4 flex items-center gap-2">
              <span className="text-lg">🧠</span>
              <h2 className="text-sm font-semibold text-ai-gradient">AI Insights</h2>
            </div>
            <p className="text-sm font-medium text-text-primary">Based on your latest application analysis:</p>
            <ul className="mt-3 space-y-2.5 text-sm text-text-secondary">
              {primaryGapReport?.strengths?.slice(0, 3).map((s) => (
                <li key={s} className="flex items-start gap-2">
                  <span className="mt-0.5 text-ai-purple">→</span>
                  {s}
                </li>
              ))}
              {!primaryGapReport && (
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-ai-cyan">→</span>
                  Apply to a job to generate a personalized gap report.
                </li>
              )}
            </ul>
            <Link to="/applications">
              <Button variant="ghost" size="sm" className="mt-4 text-ai-purple hover:bg-ai-purple/10">
                View full report →
              </Button>
            </Link>
          </div>
        </div>

        <Card className="mt-8 animate-fade-in-up delay-300 overflow-hidden">
          <div className="flex items-center justify-between border-b border-border p-6">
            <h2 className="text-lg font-semibold text-text-primary">Recent Applications</h2>
            <Link to="/applications">
              <Button variant="ghost" size="sm">
                View all →
              </Button>
            </Link>
          </div>
          <div className="divide-y divide-border">
            {appsQuery.isLoading &&
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="px-6 py-4">
                  <div className="h-12 animate-pulse rounded bg-border/70" />
                </div>
              ))}
            {!appsQuery.isLoading &&
              recentApps.map((app) => {
                const job = app.job;
                const title = job?.title ?? 'Role';
                const company = job?.company.name ?? 'Company';
                const { label, variant } = applicationStatusPresentation(app.status);
                return (
                  <Link
                    key={app.id}
                    to={`/applications/${app.id}`}
                    className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-background/50"
                  >
                    <Avatar name={company} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-text-primary">{title}</p>
                      <p className="text-sm text-text-secondary">{company}</p>
                    </div>
                    <Badge variant={variant}>{label}</Badge>
                    <div className="hidden sm:block">
                      <MatchScore value={app.matchScore} size={44} />
                    </div>
                  </Link>
                );
              })}
            {!appsQuery.isLoading && recentApps.length === 0 && (
              <div className="px-6 py-10 text-center text-sm text-text-secondary">
                No applications yet.{' '}
                <Link className="font-semibold text-primary" to="/jobs">
                  Browse jobs
                </Link>
              </div>
            )}
          </div>
        </Card>

        <div className="mt-8 grid animate-fade-in-up delay-400 gap-6 lg:grid-cols-2">
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">Skill Gaps</h2>
              {gaps.length > 0 && <Badge variant="warning">{gaps.length} gaps</Badge>}
            </div>
            <div className="space-y-3">
              {gaps.map((g) => (
                <div
                  key={g.skill}
                  className="hover-lift flex items-center justify-between rounded-card border border-border bg-background/50 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        g.severity === 'CRITICAL' ? 'bg-error' : g.severity === 'MODERATE' ? 'bg-warning' : 'bg-primary'
                      }`}
                    />
                    <div>
                      <p className="text-sm font-medium text-text-primary">{g.skill}</p>
                      <p className="text-xs text-text-secondary">Impacts multiple target roles</p>
                    </div>
                  </div>
                  <Badge variant={g.severity === 'CRITICAL' ? 'error' : g.severity === 'MODERATE' ? 'warning' : 'info'}>
                    {g.priority}
                  </Badge>
                </div>
              ))}
              {gaps.length === 0 && <p className="text-sm text-text-secondary">Gap highlights appear after you apply.</p>}
            </div>
          </Card>

          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">Learning Recommendations</h2>
              <Badge variant="ai">AI Curated</Badge>
            </div>
            <div className="space-y-3">
              {recommendations.map((r) => (
                <div
                  key={r.title}
                  className="hover-lift flex items-center gap-4 rounded-card border border-border bg-background/50 p-4"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-lg">{r.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text-primary">{r.title}</p>
                    <p className="text-xs text-text-secondary">
                      {r.platform} • {r.hours}h • {r.free ? 'Free' : 'Paid'}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" type="button">
                    Start
                  </Button>
                </div>
              ))}
              {recommendations.length === 0 && (
                <p className="text-sm text-text-secondary">Recommendations appear in your application gap reports.</p>
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
