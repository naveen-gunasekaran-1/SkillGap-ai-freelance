import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Badge, Avatar } from '@skillgap/ui';
import { Navbar } from '../components/Navbar';

const sidebarLinks = [
  { icon: '📊', label: 'Dashboard', active: true },
  { icon: '💼', label: 'Jobs', active: false },
  { icon: '📋', label: 'Applications', active: false },
  { icon: '⚙️', label: 'Settings', active: false },
];

const recentApplicants = [
  { name: 'Alice Johnson', role: 'Frontend Engineer', score: 92, status: 'New' },
  { name: 'Bob Smith', role: 'Full Stack Dev', score: 85, status: 'Reviewed' },
  { name: 'Carol Williams', role: 'Backend Engineer', score: 78, status: 'New' },
];

/**
 * Company portal dashboard with sidebar navigation, stats, recent applications, and job posting CTA.
 */
export function CompanyPortal(): React.JSX.Element {
  const [mobileNav, setMobileNav] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-7xl px-6 py-8 md:py-12">
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          {/* Sidebar */}
          <aside className="hidden lg:block">
            <Card className="sticky top-24 p-4">
              <div className="flex items-center gap-3 mb-6 p-2">
                <Avatar name="Acme Inc" size="md" />
                <div>
                  <p className="font-semibold text-text-primary text-sm">Acme Inc</p>
                  <Badge variant="success" className="mt-0.5">Verified</Badge>
                </div>
              </div>
              <nav className="space-y-1">
                {sidebarLinks.map((link) => (
                  <button key={link.label} className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${link.active ? 'bg-primary-light/60 text-primary' : 'text-text-secondary hover:bg-background hover:text-text-primary'}`}>
                    <span>{link.icon}</span>{link.label}
                  </button>
                ))}
              </nav>
            </Card>
          </aside>

          {/* Mobile nav toggle */}
          <div className="lg:hidden">
            <button onClick={() => setMobileNav(!mobileNav)} className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
              <span>☰</span> Menu
            </button>
            {mobileNav && (
              <Card className="mt-2 p-4 animate-slide-down">
                <nav className="flex flex-wrap gap-2">
                  {sidebarLinks.map((link) => (
                    <button key={link.label} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${link.active ? 'bg-primary-light/60 text-primary' : 'text-text-secondary'}`}>
                      <span>{link.icon}</span>{link.label}
                    </button>
                  ))}
                </nav>
              </Card>
            )}
          </div>

          {/* Main content */}
          <div>
            <div className="flex items-center justify-between mb-8 animate-fade-in-up">
              <div>
                <h1 className="text-2xl font-bold text-text-primary md:text-3xl">Company Portal</h1>
                <p className="mt-1 text-text-secondary">Manage job postings and find top talent</p>
              </div>
              <Badge variant="success" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5">
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.403 12.652a3 3 0 0 0 0-5.304 3 3 0 0 0-3.75-3.751 3 3 0 0 0-5.305 0 3 3 0 0 0-3.751 3.75 3 3 0 0 0 0 5.305 3 3 0 0 0 3.75 3.751 3 3 0 0 0 5.305 0 3 3 0 0 0 3.751-3.75Zm-2.546-4.46a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" /></svg>
                Verified Company
              </Badge>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-fade-in-up delay-100">
              {[
                { label: 'Active Jobs', value: '5', icon: '💼', trend: '+2 this month', color: 'text-primary' },
                { label: 'Applications', value: '42', icon: '📋', trend: '+12 this week', color: 'text-ai-purple' },
                { label: 'Interviews', value: '8', icon: '🎯', trend: '3 scheduled', color: 'text-success' },
                { label: 'Response Rate', value: '94%', icon: '⚡', trend: 'Above average', color: 'text-warning' },
              ].map((stat) => (
                <Card key={stat.label} hover className="p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{stat.icon}</span>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                  <p className="mt-2 text-sm font-medium text-text-primary">{stat.label}</p>
                  <p className="mt-0.5 text-xs text-text-secondary">{stat.trend}</p>
                </Card>
              ))}
            </div>

            {/* Recent applicants */}
            <Card className="mt-8 overflow-hidden animate-fade-in-up delay-200">
              <div className="flex items-center justify-between border-b border-border p-6">
                <h2 className="text-lg font-semibold text-text-primary">Recent Applicants</h2>
                <Button variant="ghost" size="sm">View all →</Button>
              </div>
              <div className="divide-y divide-border">
                {recentApplicants.map((a) => (
                  <div key={a.name} className="flex items-center gap-4 px-6 py-4 hover:bg-background/50 transition-colors">
                    <Avatar name={a.name} size="md" />
                    <div className="flex-1">
                      <p className="font-medium text-text-primary">{a.name}</p>
                      <p className="text-sm text-text-secondary">{a.role}</p>
                    </div>
                    <Badge variant={a.status === 'New' ? 'info' : 'success'}>{a.status}</Badge>
                    <span className="text-sm font-semibold text-primary">{a.score}%</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Post new job CTA */}
            <div className="mt-8 relative overflow-hidden rounded-2xl bg-gradient-to-r from-ai-purple to-ai-cyan p-8 text-white shadow-card animate-fade-in-up delay-300">
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
              <h2 className="text-xl font-bold">Post a New Job</h2>
              <p className="mt-2 text-white/80">Reach qualified candidates with AI-powered matching</p>
              <Button variant="secondary" className="mt-4 bg-white text-ai-purple hover:bg-white/90 border-0">
                Create Job Posting →
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}