import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MatchScore, Badge, Button, Input } from '@skillgap/ui';
import { Navbar } from '../components/Navbar';

const mockJobs = [
  {
    id: '1',
    title: 'Senior Frontend Engineer',
    company: 'TechCorp',
    location: 'San Francisco, CA',
    matchScore: 88,
    skills: ['React', 'TypeScript', 'Next.js'],
    salary: '$150k - $200k',
  },
  {
    id: '2',
    title: 'Full Stack Developer',
    company: 'StartupXYZ',
    location: 'Remote',
    matchScore: 76,
    skills: ['Node.js', 'React', 'PostgreSQL'],
    salary: '$120k - $160k',
  },
  {
    id: '3',
    title: 'Backend Engineer',
    company: 'BigTech',
    location: 'Seattle, WA',
    matchScore: 82,
    skills: ['Go', 'Kubernetes', 'AWS'],
    salary: '$160k - $210k',
  },
];

export function JobsPage(): React.JSX.Element {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-3xl font-bold text-text-primary">Job Opportunities</h1>
        <p className="mt-2 text-text-secondary">Personalized job matches based on your skills</p>

        <div className="mt-8 flex gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button>Filters</Button>
        </div>

        <div className="mt-8 space-y-4">
          {mockJobs.map((job) => (
            <Link key={job.id} to={`/jobs/${job.id}`}>
              <div className="rounded-lg border border-border bg-white p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-text-primary">{job.title}</h2>
                    <p className="mt-1 text-sm text-text-secondary">
                      {job.company} • {job.location}
                    </p>
                    <div className="mt-3 flex gap-2">
                      {job.skills.map((skill) => (
                        <Badge key={skill} variant="neutral">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    <p className="mt-3 font-medium text-primary">{job.salary}</p>
                  </div>
                  <MatchScore value={job.matchScore} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}