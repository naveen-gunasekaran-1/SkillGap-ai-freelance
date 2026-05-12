import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Badge, Avatar } from '@skillgap/ui';
import { Navbar } from '../components/Navbar';

const sidebarLinks = [
  { icon: '📊', label: 'Overview', active: true },
  { icon: '👥', label: 'Users', active: false },
  { icon: '🏢', label: 'Companies', active: false },
  { icon: '💼', label: 'Jobs', active: false },
  { icon: '📋', label: 'Reports', active: false },
  { icon: '⚙️', label: 'Settings', active: false },
];

const activity = [
  { user: 'Alice Johnson', action: 'registered as Candidate', time: '2 min ago', icon: '🆕' },
  { user: 'Acme Corp', action: 'submitted verification docs', time: '15 min ago', icon: '📄' },
  { user: 'Bob Smith', action: 'applied to 3 jobs', time: '1 hour ago', icon: '💼' },
  { user: 'CloudScale', action: 'posted new job', time: '2 hours ago', icon: '✨' },
];

/**
 * Admin panel with sidebar, stat cards with trends, activity feed, and system health.
 */
export function AdminPanel(): React.JSX.Element {
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
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-ai-cyan flex items-center justify-center"><span className="text-sm font-bold text-white">A</span></div>
                <div><p className="font-semibold text-text-primary text-sm">Admin Panel</p><p className="text-xs text-text-secondary">System Administration</p></div>
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

          {/* Mobile nav */}
          <div className="lg:hidden">
            <button onClick={() => setMobileNav(!mobileNav)} className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"><span>☰</span> Menu</button>
            {mobileNav && (
              <Card className="mt-2 p-4 animate-slide-down">
                <nav className="flex flex-wrap gap-2">{sidebarLinks.map((link) => (
                  <button key={link.label} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${link.active ? 'bg-primary-light/60 text-primary' : 'text-text-secondary'}`}><span>{link.icon}</span>{link.label}</button>
                ))}</nav>
              </Card>
            )}
          </div>

          {/* Main */}
          <div>
            <div className="mb-8 animate-fade-in-up">
              <h1 className="text-2xl font-bold text-text-primary md:text-3xl">Admin Overview</h1>
              <p className="mt-1 text-text-secondary">System administration and analytics</p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-fade-in-up delay-100">
              {[
                { label: 'Total Users', value: '1,250', trend: '+48 this week', up: true, color: 'text-primary' },
                { label: 'Active Jobs', value: '342', trend: '+15 today', up: true, color: 'text-ai-purple' },
                { label: 'Applications', value: '5,821', trend: '+230 this week', up: true, color: 'text-ai-cyan' },
                { label: 'System Health', value: '99.8%', trend: 'All systems normal', up: true, color: 'text-success' },
              ].map((stat) => (
                <Card key={stat.label} hover className="p-5">
                  <p className="text-sm text-text-secondary">{stat.label}</p>
                  <p className={`mt-2 text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <div className="mt-2 flex items-center gap-1">
                    <svg className="h-3 w-3 text-success" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.577 4.878a.75.75 0 0 1 .919-.53l4.78 1.281a.75.75 0 0 1 .531.919l-1.281 4.78a.75.75 0 0 1-1.449-.387l.81-3.022a19.407 19.407 0 0 0-5.594 5.203.75.75 0 0 1-1.139.093L7 10.06l-4.72 4.72a.75.75 0 0 1-1.06-1.061l5.25-5.25a.75.75 0 0 1 1.06 0l3.074 3.073a20.923 20.923 0 0 1 5.545-4.931l-3.042.815a.75.75 0 0 1-.53-.919Z" clipRule="evenodd" /></svg>
                    <span className="text-xs text-text-secondary">{stat.trend}</span>
                  </div>
                </Card>
              ))}
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              {/* Activity feed */}
              <Card className="overflow-hidden animate-fade-in-up delay-200">
                <div className="flex items-center justify-between border-b border-border p-6">
                  <h2 className="text-lg font-semibold text-text-primary">Recent Activity</h2>
                  <Button variant="ghost" size="sm">View all</Button>
                </div>
                <div className="divide-y divide-border">
                  {activity.map((a, i) => (
                    <div key={i} className="flex items-center gap-3 px-6 py-4">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-light text-base">{a.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-text-primary"><span className="font-semibold">{a.user}</span> {a.action}</p>
                        <p className="text-xs text-text-secondary">{a.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* System status */}
              <Card className="p-6 animate-fade-in-up delay-300">
                <h2 className="text-lg font-semibold text-text-primary mb-6">System Status</h2>
                <div className="space-y-4">
                  {[
                    { label: 'API Server', status: 'Healthy', color: 'bg-success' },
                    { label: 'Database', status: 'Connected', color: 'bg-success' },
                    { label: 'Redis Cache', status: '2.3 GB / 10 GB', color: 'bg-success' },
                    { label: 'AI Service', status: 'Operational', color: 'bg-success' },
                    { label: 'Email Service', status: 'Queue: 12', color: 'bg-warning' },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center justify-between rounded-card border border-border p-3.5">
                      <div className="flex items-center gap-3">
                        <span className={`h-2.5 w-2.5 rounded-full ${s.color}`} />
                        <span className="text-sm font-medium text-text-primary">{s.label}</span>
                      </div>
                      <span className="text-sm text-text-secondary">{s.status}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex items-center gap-2">
                  <Badge variant="info">User Management</Badge>
                  <Badge variant="warning">45 pending verifications</Badge>
                </div>
                <div className="mt-4 flex gap-3">
                  <Button className="flex-1" size="sm">Manage Users</Button>
                  <Button variant="secondary" className="flex-1" size="sm">View Logs</Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}