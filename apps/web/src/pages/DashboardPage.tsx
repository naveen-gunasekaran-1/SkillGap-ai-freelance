import { Link } from 'react-router-dom';
import { MatchScore, ProgressBar, Card, Badge, Button, Avatar } from '@skillgap/ui';
import { Navbar } from '../components/Navbar';

const quickActions = [
  { icon: '🔍', title: 'Browse Jobs', desc: 'Find new opportunities', to: '/jobs', color: 'bg-primary-light' },
  { icon: '📄', title: 'Upload Resume', desc: 'Update your profile', to: '/profile', color: 'bg-success/10' },
  { icon: '📊', title: 'View Reports', desc: 'Gap analysis results', to: '/applications', color: 'bg-ai-purple/10' },
];

const recentApps = [
  { id: '1', title: 'Senior Frontend Engineer', company: 'TechCorp', status: 'Under Review', statusColor: 'warning' as const, score: 88, date: '2 days ago' },
  { id: '2', title: 'Full Stack Developer', company: 'StartupXYZ', status: 'Interview', statusColor: 'success' as const, score: 76, date: '5 days ago' },
  { id: '3', title: 'Backend Engineer', company: 'BigTech', status: 'Rejected', statusColor: 'error' as const, score: 82, date: '1 week ago' },
];

const gaps = [
  { skill: 'Advanced TypeScript Patterns', jobs: 8, severity: 'CRITICAL' as const, priority: 'High' },
  { skill: 'AWS Cloud Architecture', jobs: 5, severity: 'MODERATE' as const, priority: 'Medium' },
  { skill: 'System Design', jobs: 4, severity: 'MINOR' as const, priority: 'Low' },
];

const recommendations = [
  { title: 'Advanced TypeScript Masterclass', platform: 'Udemy', hours: 12, free: false, icon: '📘' },
  { title: 'AWS Solutions Architect Lab', platform: 'AWS Training', hours: 20, free: true, icon: '☁️' },
  { title: 'System Design Interview Prep', platform: 'Educative', hours: 8, free: false, icon: '🏗️' },
];

/**
 * Candidate dashboard with greeting, stats, quick actions, recent applications,
 * skill gaps, and AI-powered learning recommendations.
 */
export function DashboardPage(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 py-8 md:py-12">
        {/* Greeting header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between animate-fade-in-up">
          <div className="flex items-center gap-4">
            <Avatar name="John Doe" size="lg" />
            <div>
              <h1 className="text-2xl font-bold text-text-primary md:text-3xl">Good evening, John 👋</h1>
              <p className="mt-1 text-text-secondary">Here's your career progress at a glance.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm text-text-secondary shadow-card">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            Last updated just now
          </div>
        </div>

        {/* Quick actions */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3 animate-fade-in-up delay-100">
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

        {/* Stats row */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3 animate-fade-in-up delay-200">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-text-secondary">Overall Match Score</h2>
              <Badge variant="ai">AI Powered</Badge>
            </div>
            <div className="mt-4 flex items-center justify-center">
              <MatchScore value={78} size={120} />
            </div>
            <p className="mt-4 text-center text-sm text-text-secondary">Strong match for <span className="font-semibold text-text-primary">12 jobs</span> in your area</p>
          </Card>

          <Card className="p-6">
            <h2 className="text-sm font-medium text-text-secondary">Skills Progress</h2>
            <div className="mt-5 space-y-4">
              {[{ skill: 'React', val: 92 }, { skill: 'TypeScript', val: 78 }, { skill: 'Node.js', val: 65 }, { skill: 'CSS', val: 85 }].map((s) => (
                <div key={s.skill}>
                  <div className="flex justify-between text-sm"><span className="font-medium text-text-primary">{s.skill}</span><span className="text-text-secondary">{s.val}%</span></div>
                  <ProgressBar value={s.val} showPercent={false} />
                </div>
              ))}
            </div>
          </Card>

          {/* AI Insights Card */}
          <div className="relative overflow-hidden rounded-card border border-ai-purple/20 bg-gradient-to-br from-ai-purple/5 to-ai-cyan/5 p-6 shadow-card">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-ai-purple/10 blur-2xl" />
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">🧠</span>
              <h2 className="text-sm font-semibold text-ai-gradient">AI Insights</h2>
            </div>
            <p className="text-sm font-medium text-text-primary">Based on your profile analysis:</p>
            <ul className="mt-3 space-y-2.5 text-sm text-text-secondary">
              <li className="flex items-start gap-2"><span className="mt-0.5 text-ai-purple">→</span>Learning TypeScript generics could unlock 5 more job matches</li>
              <li className="flex items-start gap-2"><span className="mt-0.5 text-ai-cyan">→</span>Your React skills are above average for your target roles</li>
              <li className="flex items-start gap-2"><span className="mt-0.5 text-success">→</span>Consider adding AWS certification to boost match scores by ~15%</li>
            </ul>
            <Link to="/applications">
              <Button variant="ghost" size="sm" className="mt-4 text-ai-purple hover:bg-ai-purple/10">View full report →</Button>
            </Link>
          </div>
        </div>

        {/* Recent Applications */}
        <Card className="mt-8 overflow-hidden animate-fade-in-up delay-300">
          <div className="flex items-center justify-between border-b border-border p-6">
            <h2 className="text-lg font-semibold text-text-primary">Recent Applications</h2>
            <Link to="/applications"><Button variant="ghost" size="sm">View all →</Button></Link>
          </div>
          <div className="divide-y divide-border">
            {recentApps.map((app) => (
              <Link key={app.id} to={`/applications/${app.id}`} className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-background/50">
                <Avatar name={app.company} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text-primary truncate">{app.title}</p>
                  <p className="text-sm text-text-secondary">{app.company} • {app.date}</p>
                </div>
                <Badge variant={app.statusColor}>{app.status}</Badge>
                <div className="hidden sm:block"><MatchScore value={app.score} size={44} /></div>
              </Link>
            ))}
          </div>
        </Card>

        {/* Skill Gaps + Recommendations */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2 animate-fade-in-up delay-400">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">Skill Gaps</h2>
              <Badge variant="warning">{gaps.length} gaps</Badge>
            </div>
            <div className="space-y-3">
              {gaps.map((g) => (
                <div key={g.skill} className="flex items-center justify-between rounded-card border border-border bg-background/50 p-4 hover-lift">
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${g.severity === 'CRITICAL' ? 'bg-error' : g.severity === 'MODERATE' ? 'bg-warning' : 'bg-primary'}`} />
                    <div>
                      <p className="text-sm font-medium text-text-primary">{g.skill}</p>
                      <p className="text-xs text-text-secondary">Needed for {g.jobs} job matches</p>
                    </div>
                  </div>
                  <Badge variant={g.severity === 'CRITICAL' ? 'error' : g.severity === 'MODERATE' ? 'warning' : 'info'}>{g.priority}</Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">Learning Recommendations</h2>
              <Badge variant="ai">AI Curated</Badge>
            </div>
            <div className="space-y-3">
              {recommendations.map((r) => (
                <div key={r.title} className="flex items-center gap-4 rounded-card border border-border bg-background/50 p-4 hover-lift">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-lg">{r.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{r.title}</p>
                    <p className="text-xs text-text-secondary">{r.platform} • {r.hours}h • {r.free ? 'Free' : 'Paid'}</p>
                  </div>
                  <Button variant="ghost" size="sm">Start</Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}