import { useParams, Link } from 'react-router-dom';
import { Button, Badge, Card, ProgressBar, MatchScore } from '@skillgap/ui';
import { Navbar } from '../components/Navbar';

const timeline = [
  { label: 'Application submitted', time: 'May 1, 2026 at 2:30 PM', done: true },
  { label: 'Application received', time: 'May 1, 2026 at 3:15 PM', done: true },
  { label: 'Under review', time: 'May 3, 2026', done: true, active: true },
  { label: 'Interview scheduled', time: 'Pending', done: false },
  { label: 'Decision', time: 'Pending', done: false },
];

const gapItems = [
  { skill: 'Performance Optimization', required: 'Expert-level proficiency', candidate: 'Basic knowledge', severity: 'CRITICAL' as const, explanation: 'The role requires deep experience with React profiling, bundle optimization, and Core Web Vitals. Your profile shows limited exposure.' },
  { skill: 'State Management at Scale', required: 'Complex state architecture', candidate: 'Basic Zustand usage', severity: 'MODERATE' as const, explanation: 'You have experience with Zustand but the role requires managing complex, normalized state across large applications.' },
];

const recommendations = [
  { title: 'React Performance Deep Dive', platform: 'Frontend Masters', hours: 6, free: false },
  { title: 'Web Vitals Optimization Guide', platform: 'web.dev', hours: 3, free: true },
  { title: 'Advanced State Patterns', platform: 'Udemy', hours: 8, free: false },
];

/**
 * Application detail with visual timeline, gap report, and learning recommendations.
 */
export function ApplicationDetailPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-8 md:py-12">
        <nav className="flex items-center gap-2 text-sm text-text-secondary animate-fade-in-up">
          <Link to="/applications" className="hover:text-primary transition-colors">Applications</Link>
          <span>/</span>
          <span className="text-text-primary font-medium">Senior Frontend Engineer</span>
        </nav>

        {/* Header card */}
        <Card className="mt-6 p-6 md:p-8 animate-fade-in-up delay-100">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-text-primary md:text-3xl">Senior Frontend Engineer</h1>
              <p className="mt-2 text-text-secondary">TechCorp • San Francisco, CA</p>
            </div>
            <Badge variant="warning" className="self-start text-sm px-4 py-1.5">Under Review</Badge>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-4">
            {[{ label: 'Applied', value: 'May 1, 2026' }, { label: 'Last update', value: 'May 3, 2026' }, { label: 'Match score', value: '88%' }, { label: 'Status', value: 'Under Review' }].map((d) => (
              <div key={d.label} className="rounded-card border border-border bg-background/50 p-3">
                <p className="text-xs text-text-secondary">{d.label}</p>
                <p className="mt-1 text-sm font-semibold text-text-primary">{d.value}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Timeline */}
        <Card className="mt-6 p-6 md:p-8 animate-fade-in-up delay-200">
          <h2 className="text-lg font-semibold text-text-primary mb-6">Application Timeline</h2>
          <div className="relative">
            {timeline.map((step, i) => (
              <div key={step.label} className="relative flex gap-4 pb-8 last:pb-0">
                {/* Vertical line */}
                {i < timeline.length - 1 && (
                  <div className={`absolute left-[11px] top-6 h-full w-0.5 ${step.done ? 'bg-primary' : 'bg-border'}`} />
                )}
                {/* Dot */}
                <div className={`relative z-10 mt-0.5 h-6 w-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  step.active ? 'border-primary bg-primary' : step.done ? 'border-primary bg-primary' : 'border-border bg-white'
                }`}>
                  {step.done && <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>}
                  {step.active && <span className="h-2 w-2 rounded-full bg-white" />}
                </div>
                <div>
                  <p className={`font-medium ${step.done ? 'text-text-primary' : 'text-text-secondary'}`}>{step.label}</p>
                  <p className="text-sm text-text-secondary">{step.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Gap Report */}
        <Card className="mt-6 p-6 md:p-8 animate-fade-in-up delay-300">
          <div className="flex items-center gap-2 mb-6">
            <Badge variant="ai">AI Generated</Badge>
            <h2 className="text-lg font-semibold text-text-primary">Gap Analysis Report</h2>
          </div>
          <div className="space-y-4">
            {gapItems.map((g) => (
              <div key={g.skill} className={`rounded-card border p-5 ${g.severity === 'CRITICAL' ? 'border-error/20 bg-error/5' : 'border-warning/20 bg-warning/5'}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-text-primary">{g.skill}</h3>
                  <Badge variant={g.severity === 'CRITICAL' ? 'error' : 'warning'}>{g.severity}</Badge>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 text-sm mb-3">
                  <div><span className="text-text-secondary">Required: </span><span className="text-text-primary">{g.required}</span></div>
                  <div><span className="text-text-secondary">You have: </span><span className="text-text-primary">{g.candidate}</span></div>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">{g.explanation}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Learning Recommendations */}
        <Card className="mt-6 p-6 md:p-8 animate-fade-in-up delay-400">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-lg">📚</span>
            <h2 className="text-lg font-semibold text-text-primary">Recommended Learning</h2>
          </div>
          <div className="space-y-3">
            {recommendations.map((r) => (
              <div key={r.title} className="flex items-center justify-between rounded-card border border-border p-4 hover-lift">
                <div>
                  <p className="text-sm font-medium text-text-primary">{r.title}</p>
                  <p className="text-xs text-text-secondary">{r.platform} • {r.hours}h • {r.free ? 'Free' : 'Paid'}</p>
                </div>
                <Button variant="ghost" size="sm">Start →</Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Actions */}
        <div className="mt-6 flex gap-3 animate-fade-in-up delay-500">
          <Link to={`/jobs/1`}><Button>View Job</Button></Link>
          <Button variant="secondary">Withdraw Application</Button>
        </div>
      </main>
    </div>
  );
}