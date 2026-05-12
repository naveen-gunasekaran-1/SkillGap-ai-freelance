import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button, Badge, Card, ProgressBar, MatchScore, Avatar } from '@skillgap/ui';
import { Navbar } from '../components/Navbar';

const tabs = ['Overview', 'Requirements', 'Company', 'Gap Analysis'] as const;
type Tab = typeof tabs[number];

const skillMatch = [
  { name: 'React', val: 95, status: 'match' as const },
  { name: 'TypeScript', val: 85, status: 'match' as const },
  { name: 'CSS / Responsive Design', val: 78, status: 'match' as const },
  { name: 'State Management', val: 60, status: 'partial' as const },
  { name: 'Performance Optimization', val: 30, status: 'critical' as const },
];

/**
 * Job detail page with tabbed content, match score sidebar, and apply drawer.
 */
export function JobDetailPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const [applyOpen, setApplyOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-8 md:py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-text-secondary animate-fade-in-up">
          <Link to="/jobs" className="hover:text-primary transition-colors">Jobs</Link>
          <span>/</span>
          <span className="text-text-primary font-medium">Senior Frontend Engineer</span>
        </nav>

        {/* Header */}
        <div className="mt-6 animate-fade-in-up delay-100">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-4">
              <Avatar name="TechCorp" size="lg" />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold text-text-primary md:text-3xl">Senior Frontend Engineer</h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary-light px-2.5 py-0.5 text-xs font-medium text-primary">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.403 12.652a3 3 0 0 0 0-5.304 3 3 0 0 0-3.75-3.751 3 3 0 0 0-5.305 0 3 3 0 0 0-3.751 3.75 3 3 0 0 0 0 5.305 3 3 0 0 0 3.75 3.751 3 3 0 0 0 5.305 0 3 3 0 0 0 3.751-3.75Zm-2.546-4.46a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" /></svg>
                    Verified
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-text-secondary">
                  <span className="font-medium text-primary">TechCorp</span>
                  <span>•</span><span>San Francisco, CA</span>
                  <span>•</span><Badge variant="info">Full Time</Badge>
                  <span>•</span><span className="font-semibold text-text-primary">$150k - $200k</span>
                  <span>•</span><span>Posted 2 days ago</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" size="sm">
                <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" /></svg>
                Save
              </Button>
              <Button onClick={() => setApplyOpen(true)}>Apply Now</Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-8 border-b border-border animate-fade-in-up delay-200">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`whitespace-nowrap px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content grid */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px] animate-fade-in-up delay-300">
          {/* Main content */}
          <div>
            {activeTab === 'Overview' && (
              <Card className="p-6 md:p-8">
                <h2 className="text-lg font-semibold text-text-primary">About the role</h2>
                <p className="mt-3 text-text-secondary leading-relaxed">We're looking for an experienced Frontend Engineer to join our growing team. You'll work on cutting-edge web applications using React and TypeScript, collaborating with designers and backend engineers to deliver exceptional user experiences.</p>
                <h3 className="mt-8 text-base font-semibold text-text-primary">Responsibilities</h3>
                <ul className="mt-3 space-y-2.5">
                  {['Build and maintain frontend applications', 'Collaborate with product and design teams', 'Optimize performance and user experience', 'Mentor junior developers', 'Participate in code reviews and architecture decisions'].map((r) => (
                    <li key={r} className="flex items-start gap-2.5 text-sm text-text-secondary"><span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />{r}</li>
                  ))}
                </ul>
              </Card>
            )}
            {activeTab === 'Requirements' && (
              <Card className="p-6 md:p-8">
                <h2 className="text-lg font-semibold text-text-primary">Requirements</h2>
                <ul className="mt-4 space-y-3">
                  {['5+ years of experience with React and modern JavaScript', 'Strong TypeScript knowledge', 'Experience with state management (Zustand, Redux)', 'Proficiency with CSS and responsive design', 'Excellent communication skills', 'Experience with testing frameworks (Jest, Playwright)'].map((r) => (
                    <li key={r} className="flex items-start gap-2.5 text-sm text-text-secondary"><span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />{r}</li>
                  ))}
                </ul>
                <h3 className="mt-8 text-base font-semibold text-text-primary">Nice to have</h3>
                <ul className="mt-3 space-y-3">
                  {['Experience with Next.js or similar SSR frameworks', 'Familiarity with CI/CD pipelines', 'Open source contributions'].map((r) => (
                    <li key={r} className="flex items-start gap-2.5 text-sm text-text-secondary"><span className="mt-1 h-1.5 w-1.5 rounded-full bg-border flex-shrink-0" />{r}</li>
                  ))}
                </ul>
              </Card>
            )}
            {activeTab === 'Company' && (
              <Card className="p-6 md:p-8">
                <div className="flex items-center gap-4">
                  <Avatar name="TechCorp" size="lg" />
                  <div>
                    <h2 className="text-lg font-semibold text-text-primary">TechCorp</h2>
                    <p className="text-sm text-text-secondary">Technology • 500-1000 employees</p>
                  </div>
                </div>
                <p className="mt-4 text-text-secondary leading-relaxed">TechCorp is a leading technology company building next-generation web and mobile applications. We focus on developer experience and cutting-edge tooling.</p>
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  {[{ label: 'Industry', value: 'Technology' }, { label: 'Company size', value: '500-1000' }, { label: 'Founded', value: '2018' }].map((d) => (
                    <div key={d.label} className="rounded-card border border-border p-3"><p className="text-xs text-text-secondary">{d.label}</p><p className="mt-1 text-sm font-semibold text-text-primary">{d.value}</p></div>
                  ))}
                </div>
              </Card>
            )}
            {activeTab === 'Gap Analysis' && (
              <Card className="p-6 md:p-8">
                <div className="flex items-center gap-2 mb-6"><Badge variant="ai">AI Analysis</Badge><h2 className="text-lg font-semibold text-text-primary">Your Skill Match</h2></div>
                <div className="space-y-4">
                  {skillMatch.map((s) => (
                    <div key={s.name}>
                      <div className="flex items-center justify-between text-sm mb-1.5">
                        <span className="font-medium text-text-primary">{s.name}</span>
                        <span className={`font-semibold ${s.val >= 70 ? 'text-success' : s.val >= 40 ? 'text-warning' : 'text-error'}`}>{s.val}%</span>
                      </div>
                      <ProgressBar value={s.val} showPercent={false} />
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Right sidebar — Match card */}
          <div className="space-y-6">
            <Card className="p-6 text-center">
              <h3 className="text-sm font-semibold text-text-secondary">Your Match</h3>
              <div className="mt-4 flex justify-center"><MatchScore value={88} size={100} /></div>
              <p className="mt-3 text-sm text-text-secondary">You have <span className="font-semibold text-text-primary">88%</span> of required skills</p>
              <Button className="mt-6 w-full" onClick={() => setApplyOpen(true)}>Apply Now</Button>
              <Button variant="secondary" className="mt-2 w-full">Save Job</Button>
            </Card>
            <Card className="p-6">
              <h3 className="text-sm font-semibold text-text-primary mb-3">Required Skills</h3>
              <div className="flex flex-wrap gap-1.5">
                {['React', 'TypeScript', 'CSS', 'Next.js', 'Testing'].map((s) => <Badge key={s} variant="neutral">{s}</Badge>)}
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Apply drawer overlay */}
      {applyOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm animate-fade-in" onClick={() => setApplyOpen(false)} />
          <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white shadow-elevated animate-slide-in-right">
            <div className="flex h-full flex-col p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-text-primary">Apply for this job</h2>
                <button onClick={() => setApplyOpen(false)} className="rounded-lg p-2 text-text-secondary hover:bg-background transition-colors" aria-label="Close">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="flex-1 space-y-6">
                <div className="rounded-card border-2 border-dashed border-border p-8 text-center">
                  <span className="text-3xl">📄</span>
                  <p className="mt-2 text-sm font-medium text-text-primary">Upload your resume</p>
                  <p className="mt-1 text-xs text-text-secondary">PDF, DOC up to 5MB</p>
                  <Button variant="secondary" size="sm" className="mt-3">Browse files</Button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">Cover note (optional)</label>
                  <textarea className="w-full rounded-card border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary-light min-h-[120px]" placeholder="Why are you a great fit for this role?" />
                </div>
              </div>
              <Button variant="ai-gradient" className="w-full mt-6" size="lg">Confirm & Apply</Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}