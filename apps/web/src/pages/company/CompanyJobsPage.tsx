import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, Badge, Button, Avatar } from '@skillgap/ui';
import {
  Briefcase,
  Plus,
  Search,
  Eye,
  Edit3,
  Users,
  Clock,
  CheckCircle2,
  PauseCircle,
} from 'lucide-react';
import { AppShell } from '../../components/AppShell';
import { formatPosted } from '../../lib/format';
import { api } from '../../lib/api';
import { parseJob } from '../../lib/normalize';
import type { Job } from '@skillgap/types';

type CompanyJob = Job & {
  status: 'ACTIVE' | 'PAUSED' | 'CLOSED';
  applicantCount: number;
};

const typeLabels = {
  FULL_TIME: 'Full Time',
  PART_TIME: 'Part Time',
  INTERNSHIP: 'Internship',
  CONTRACT: 'Contract',
};

const statusConfig = {
  ACTIVE: { label: 'Active', variant: 'success' as const, icon: CheckCircle2 },
  PAUSED: { label: 'Paused', variant: 'warning' as const, icon: PauseCircle },
  CLOSED: { label: 'Closed', variant: 'neutral' as const, icon: Clock },
};

/**
 * Company job listings management page.
 */
export function CompanyJobsPage(): React.JSX.Element {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PAUSED' | 'CLOSED'>('ALL');

  const jobsQuery = useQuery({
    queryKey: ['company', 'jobs'],
    queryFn: async (): Promise<CompanyJob[]> => {
      const res = await api.get<{ jobs: unknown[] }>('/jobs/company/mine');
      return res.data.jobs.map((raw) => {
        const record = raw as Record<string, unknown>;
        return {
          ...parseJob(raw),
          applicantCount: Number(record.applicantCount ?? 0),
          status:
            record.expiresAt && new Date(String(record.expiresAt)) < new Date()
              ? 'CLOSED'
              : 'ACTIVE',
        };
      });
    },
  });

  const jobs = jobsQuery.data ?? [];

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.location.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = jobs.filter((j) => j.status === 'ACTIVE').length;
  const pausedCount = jobs.filter((j) => j.status === 'PAUSED').length;
  const totalApplicants = jobs.reduce((sum, j) => sum + j.applicantCount, 0);

  return (
    <AppShell>
      <div className="p-4 lg:p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-bold text-text-primary md:text-3xl">Job Listings</h1>
            <p className="mt-1 text-text-secondary">Manage your company&apos;s job postings</p>
          </div>
          <Link to="/company/jobs/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Post New Job
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3 animate-fade-in-up delay-100">
          <Card className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10">
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{activeCount}</p>
              <p className="text-sm text-text-secondary">Active Jobs</p>
            </div>
          </Card>
          <Card className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10">
              <PauseCircle className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{pausedCount}</p>
              <p className="text-sm text-text-secondary">Paused Jobs</p>
            </div>
          </Card>
          <Card className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{totalApplicants}</p>
              <p className="text-sm text-text-secondary">Total Applicants</p>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in-up delay-200">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-border bg-white text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="flex gap-2">
            {(['ALL', 'ACTIVE', 'PAUSED', 'CLOSED'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-primary text-white'
                    : 'bg-background text-text-secondary hover:text-text-primary'
                }`}
              >
                {status === 'ALL' ? 'All' : statusConfig[status].label}
              </button>
            ))}
          </div>
        </div>

        {/* Jobs List */}
        <div className="mt-6 space-y-3 animate-fade-in-up delay-300">
          {jobsQuery.isLoading && (
            <Card className="p-5">
              <div className="h-16 animate-pulse rounded bg-border/70" />
            </Card>
          )}

          {filteredJobs.map((job) => {
            const { label, variant, icon: StatusIcon } = statusConfig[job.status];
            return (
              <Card key={job.id} hover className="p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-light flex-shrink-0">
                    <Briefcase className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-text-primary">{job.title}</h3>
                      <Badge variant={variant}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {label}
                      </Badge>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-text-secondary">
                      <span>{job.location}</span>
                      <span>-</span>
                      <span>{typeLabels[job.type]}</span>
                      <span>-</span>
                      <span>{formatPosted(job.postedAt)}</span>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-text-primary">
                        {job.applicantCount}
                      </p>
                      <p className="text-xs text-text-secondary">Applicants</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Link to={`/company/jobs/${job.id}/applicants`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </Link>
                      <Link to={`/company/jobs/${job.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}

          {!jobsQuery.isLoading && filteredJobs.length === 0 && (
            <div className="py-16 text-center">
              <Briefcase className="h-12 w-12 text-text-secondary mx-auto mb-4" />
              <p className="text-lg font-medium text-text-primary">No jobs found</p>
              <p className="mt-2 text-sm text-text-secondary">
                {search || statusFilter !== 'ALL'
                  ? 'Try adjusting your filters'
                  : 'Post your first job to get started'}
              </p>
              {!search && statusFilter === 'ALL' && (
                <Link to="/company/jobs/new">
                  <Button className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Post Your First Job
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
