import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Card, MatchScore, Avatar } from '@skillgap/ui';
import { Navbar } from '../components/Navbar';

const statusFilters = ['All', 'Reviewing', 'Interview', 'Offer', 'Rejected'] as const;
type StatusFilter = typeof statusFilters[number];

const mockApplications = [
  { id: '1', title: 'Senior Frontend Engineer', company: 'TechCorp', status: 'Under Review', statusKey: 'Reviewing', statusColor: 'warning' as const, score: 88, applied: 'May 1, 2026', updated: '2 days ago' },
  { id: '2', title: 'Full Stack Developer', company: 'StartupXYZ', status: 'Interview Scheduled', statusKey: 'Interview', statusColor: 'success' as const, score: 76, applied: 'Apr 28, 2026', updated: '5 days ago' },
  { id: '3', title: 'Backend Engineer', company: 'BigTech', status: 'Rejected', statusKey: 'Rejected', statusColor: 'error' as const, score: 82, applied: 'Apr 20, 2026', updated: '1 week ago' },
  { id: '4', title: 'React Native Dev', company: 'MobileFirst', status: 'Offer Extended', statusKey: 'Offer', statusColor: 'success' as const, score: 71, applied: 'Apr 15, 2026', updated: '3 days ago' },
];

/**
 * Applications tracker with status filter tabs, enhanced cards with match scores, and sort options.
 */
export function ApplicationsPage(): React.JSX.Element {
  const [filter, setFilter] = useState<StatusFilter>('All');
  const [sort, setSort] = useState<'date' | 'score'>('date');

  const filtered = mockApplications
    .filter((a) => filter === 'All' || a.statusKey === filter)
    .sort((a, b) => sort === 'score' ? b.score - a.score : 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-8 md:py-12">
        <div className="animate-fade-in-up">
          <h1 className="text-2xl font-bold text-text-primary md:text-3xl">Your Applications</h1>
          <p className="mt-2 text-text-secondary">Track your job applications, interviews, and outcomes</p>
        </div>

        {/* Status filter tabs */}
        <div className="mt-6 flex items-center justify-between gap-4 animate-fade-in-up delay-100">
          <div className="flex gap-1 overflow-x-auto rounded-xl bg-white border border-border p-1 shadow-card">
            {statusFilters.map((s) => (
              <button key={s} onClick={() => setFilter(s)} className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150 ${filter === s ? 'bg-primary text-white shadow-card' : 'text-text-secondary hover:text-text-primary hover:bg-background'}`}>
                {s}
              </button>
            ))}
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value as 'date' | 'score')} className="hidden sm:block rounded-card border border-border bg-white px-3 py-2 text-sm text-text-primary outline-none focus:border-primary">
            <option value="date">Sort by date</option>
            <option value="score">Sort by match</option>
          </select>
        </div>

        {/* Application cards */}
        <div className="mt-6 space-y-3">
          {filtered.map((app, i) => (
            <Link key={app.id} to={`/applications/${app.id}`} className="block animate-fade-in-up" style={{ animationDelay: `${i * 60 + 150}ms` }}>
              <Card hover className="p-5">
                <div className="flex items-center gap-4">
                  <Avatar name={app.company} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold text-text-primary truncate">{app.title}</h2>
                    </div>
                    <p className="mt-1 text-sm text-text-secondary">{app.company} • Applied {app.applied}</p>
                  </div>

                  {/* Timeline indicator dot */}
                  <div className="hidden sm:flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <div className={`h-2.5 w-2.5 rounded-full ${app.statusColor === 'success' ? 'bg-success' : app.statusColor === 'error' ? 'bg-error' : 'bg-warning'}`} />
                      <span className="text-xs text-text-secondary">{app.updated}</span>
                    </div>
                    <Badge variant={app.statusColor}>{app.status}</Badge>
                    <MatchScore value={app.score} size={44} />
                  </div>
                  {/* Mobile status */}
                  <div className="sm:hidden">
                    <Badge variant={app.statusColor}>{app.status}</Badge>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
          {filtered.length === 0 && (
            <div className="py-20 text-center">
              <span className="text-4xl">📋</span>
              <p className="mt-4 text-lg font-medium text-text-primary">No applications found</p>
              <p className="mt-2 text-sm text-text-secondary">Try changing the filter or apply to more jobs</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}