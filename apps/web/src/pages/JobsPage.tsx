import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MatchScore, Badge, Button, Input, Skeleton, Avatar, Card } from '@skillgap/ui';
import { Navbar } from '../components/Navbar';

const mockJobs = [
  { id: '1', title: 'Senior Frontend Engineer', company: 'TechCorp', location: 'San Francisco, CA', matchScore: 88, skills: ['React', 'TypeScript', 'Next.js', 'CSS', 'GraphQL'], salary: '$150k - $200k', type: 'FULL_TIME', verified: true, posted: '2d ago' },
  { id: '2', title: 'Full Stack Developer', company: 'StartupXYZ', location: 'Remote', matchScore: 76, skills: ['Node.js', 'React', 'PostgreSQL', 'Docker'], salary: '$120k - $160k', type: 'FULL_TIME', verified: true, posted: '3d ago' },
  { id: '3', title: 'Backend Engineer', company: 'BigTech', location: 'Seattle, WA', matchScore: 82, skills: ['Go', 'Kubernetes', 'AWS', 'gRPC', 'Redis'], salary: '$160k - $210k', type: 'FULL_TIME', verified: false, posted: '1w ago' },
  { id: '4', title: 'React Native Developer', company: 'MobileFirst', location: 'Austin, TX', matchScore: 71, skills: ['React Native', 'TypeScript', 'Expo'], salary: '$110k - $140k', type: 'CONTRACT', verified: true, posted: '4d ago' },
  { id: '5', title: 'DevOps Intern', company: 'CloudScale', location: 'Remote', matchScore: 55, skills: ['Docker', 'CI/CD', 'Linux'], salary: '$30/hr', type: 'INTERNSHIP', verified: true, posted: '1d ago' },
];

const typeLabels: Record<string, string> = { FULL_TIME: 'Full Time', PART_TIME: 'Part Time', INTERNSHIP: 'Internship', CONTRACT: 'Contract' };
const typeColors: Record<string, string> = { FULL_TIME: 'bg-primary-light text-primary', PART_TIME: 'bg-success/10 text-success', INTERNSHIP: 'bg-warning/10 text-warning', CONTRACT: 'bg-ai-purple/10 text-ai-purple' };
const jobTypes = ['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT'];

/**
 * Job discovery page with filter sidebar, job cards, and featured companies.
 */
export function JobsPage(): React.JSX.Element {
  const [search, setSearch] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const toggleType = (t: string) => setSelectedTypes((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);

  const filtered = mockJobs.filter((j) => {
    if (search && !j.title.toLowerCase().includes(search.toLowerCase()) && !j.company.toLowerCase().includes(search.toLowerCase())) return false;
    if (selectedTypes.length > 0 && !selectedTypes.includes(j.type)) return false;
    if (verifiedOnly && !j.verified) return false;
    return true;
  });

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-3">Job Type</h3>
        <div className="space-y-2">
          {jobTypes.map((t) => (
            <label key={t} className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={selectedTypes.includes(t)} onChange={() => toggleType(t)} className="h-4 w-4 rounded border-border text-primary focus:ring-primary" />
              <span className="text-sm text-text-secondary">{typeLabels[t]}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="border-t border-border pt-6">
        <h3 className="text-sm font-semibold text-text-primary mb-3">Verification</h3>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <div onClick={() => setVerifiedOnly(!verifiedOnly)} className={`relative h-5 w-9 rounded-full transition-colors duration-200 cursor-pointer ${verifiedOnly ? 'bg-primary' : 'bg-border'}`}>
            <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${verifiedOnly ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </div>
          <span className="text-sm text-text-secondary">Verified only</span>
        </label>
      </div>
      {(selectedTypes.length > 0 || verifiedOnly) && (
        <button type="button" onClick={() => { setSelectedTypes([]); setVerifiedOnly(false); }} className="text-sm font-medium text-primary hover:text-primary-dark transition-colors">Clear all filters</button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 py-8 md:py-12">
        {/* Header */}
        <div className="animate-fade-in-up">
          <h1 className="text-2xl font-bold text-text-primary md:text-3xl">Job Opportunities</h1>
          <p className="mt-2 text-text-secondary">Personalized job matches based on your skills</p>
        </div>

        {/* Search bar */}
        <div className="mt-6 flex gap-3 animate-fade-in-up delay-100">
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
            <Input type="text" placeholder="Search jobs, companies, or skills..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Button variant="secondary" className="lg:hidden" onClick={() => setShowFilters(!showFilters)}>
            <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" /></svg>
            Filters
          </Button>
        </div>

        {/* Mobile filter drawer */}
        {showFilters && (
          <div className="mt-4 rounded-card border border-border bg-white p-6 shadow-card lg:hidden animate-slide-down">
            <FilterPanel />
          </div>
        )}

        {/* Results count */}
        <p className="mt-4 text-sm text-text-secondary animate-fade-in-up delay-200">{filtered.length} {filtered.length === 1 ? 'job' : 'jobs'} found</p>

        {/* 3-column layout */}
        <div className="mt-6 grid gap-8 lg:grid-cols-[240px_1fr_240px]">
          {/* Left sidebar — Filters (desktop) */}
          <aside className="hidden lg:block">
            <Card className="sticky top-24 p-6">
              <h2 className="text-base font-semibold text-text-primary mb-5">Filters</h2>
              <FilterPanel />
            </Card>
          </aside>

          {/* Center — Job cards */}
          <div className="space-y-4">
            {filtered.map((job, i) => (
              <Link key={job.id} to={`/jobs/${job.id}`} className="block animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
                <Card hover className="p-5 transition-all duration-200">
                  <div className="flex items-start gap-4">
                    <Avatar name={job.company} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-base font-semibold text-text-primary">{job.title}</h2>
                        {job.verified && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary-light px-2 py-0.5 text-xs font-medium text-primary">
                            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.403 12.652a3 3 0 0 0 0-5.304 3 3 0 0 0-3.75-3.751 3 3 0 0 0-5.305 0 3 3 0 0 0-3.751 3.75 3 3 0 0 0 0 5.305 3 3 0 0 0 3.75 3.751 3 3 0 0 0 5.305 0 3 3 0 0 0 3.751-3.75Zm-2.546-4.46a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" /></svg>
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-text-secondary">{job.company} • {job.location} • {job.posted}</p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${typeColors[job.type]}`}>{typeLabels[job.type]}</span>
                        {job.skills.slice(0, 4).map((s) => (
                          <Badge key={s} variant="neutral">{s}</Badge>
                        ))}
                        {job.skills.length > 4 && <Badge variant="neutral">+{job.skills.length - 4} more</Badge>}
                      </div>
                      <p className="mt-2.5 text-sm font-semibold text-primary">{job.salary}</p>
                    </div>
                    <div className="hidden sm:block flex-shrink-0">
                      <MatchScore value={job.matchScore} size={56} />
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
            {filtered.length === 0 && (
              <div className="py-20 text-center">
                <span className="text-4xl">🔍</span>
                <p className="mt-4 text-lg font-medium text-text-primary">No jobs found</p>
                <p className="mt-2 text-sm text-text-secondary">Try adjusting your filters or search query</p>
              </div>
            )}
          </div>

          {/* Right sidebar — Featured companies */}
          <aside className="hidden lg:block">
            <Card className="sticky top-24 p-6">
              <h2 className="text-base font-semibold text-text-primary mb-4">Featured Companies</h2>
              <div className="space-y-4">
                {[{ name: 'TechCorp', jobs: 12 }, { name: 'StartupXYZ', jobs: 8 }, { name: 'BigTech', jobs: 15 }].map((c) => (
                  <div key={c.name} className="flex items-center gap-3">
                    <Avatar name={c.name} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-text-primary">{c.name}</p>
                      <p className="text-xs text-text-secondary">{c.jobs} open positions</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
}