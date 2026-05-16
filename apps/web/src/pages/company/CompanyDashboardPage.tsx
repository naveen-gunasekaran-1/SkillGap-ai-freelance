import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, Badge, Button, Avatar, MatchScore } from '@skillgap/ui';
import {
  Briefcase,
  Users,
  TrendingUp,
  Clock,
  CheckCircle2,
  ArrowRight,
  PlusCircle,
  Eye,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { AppShell } from '../../components/AppShell';
import { api } from '../../lib/api';

interface DashboardStats {
  activeJobs: number;
  totalApplications: number;
  scheduledInterviews: number;
  responseRate: number;
}

interface RecentApplicant {
  id: string;
  name: string;
  role: string;
  matchScore: number;
  appliedAt: string;
  status: 'NEW' | 'REVIEWED' | 'SHORTLISTED';
}

/**
 * Company dashboard with hiring metrics, recent applicants, and quick actions.
 */
export function CompanyDashboardPage(): React.JSX.Element {
  const statsQuery = useQuery({
    queryKey: ['company', 'stats'],
    queryFn: async (): Promise<DashboardStats> => {
      // Mock data for now
      return {
        activeJobs: 5,
        totalApplications: 42,
        scheduledInterviews: 8,
        responseRate: 94,
      };
    },
  });

  const applicantsQuery = useQuery({
    queryKey: ['company', 'recent-applicants'],
    queryFn: async (): Promise<RecentApplicant[]> => {
      // Mock data for now
      return [
        { id: '1', name: 'Alice Johnson', role: 'Frontend Engineer', matchScore: 92, appliedAt: '2 hours ago', status: 'NEW' },
        { id: '2', name: 'Bob Smith', role: 'Full Stack Developer', matchScore: 85, appliedAt: '5 hours ago', status: 'REVIEWED' },
        { id: '3', name: 'Carol Williams', role: 'Backend Engineer', matchScore: 78, appliedAt: '1 day ago', status: 'NEW' },
        { id: '4', name: 'David Chen', role: 'DevOps Engineer', matchScore: 88, appliedAt: '2 days ago', status: 'SHORTLISTED' },
      ];
    },
  });

  const stats = statsQuery.data;
  const applicants = applicantsQuery.data ?? [];

  const statCards = [
    { 
      label: 'Active Jobs', 
      value: stats?.activeJobs ?? 0, 
      icon: <Briefcase className="h-5 w-5" />, 
      trend: '+2 this month', 
      color: 'text-primary',
      bgColor: 'bg-primary-light',
    },
    { 
      label: 'Applications', 
      value: stats?.totalApplications ?? 0, 
      icon: <Users className="h-5 w-5" />, 
      trend: '+12 this week', 
      color: 'text-ai-purple',
      bgColor: 'bg-ai-purple/10',
    },
    { 
      label: 'Interviews', 
      value: stats?.scheduledInterviews ?? 0, 
      icon: <Calendar className="h-5 w-5" />, 
      trend: '3 scheduled today', 
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    { 
      label: 'Response Rate', 
      value: `${stats?.responseRate ?? 0}%`, 
      icon: <TrendingUp className="h-5 w-5" />, 
      trend: 'Above average', 
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
  ];

  return (
    <AppShell>
      <div className="p-4 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-bold text-text-primary md:text-3xl">Company Dashboard</h1>
            <p className="mt-1 text-text-secondary">Manage job postings and find top talent</p>
          </div>
          <div className="flex gap-3">
            <Badge variant="success" className="flex items-center gap-1.5 px-3 py-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Verified Company
            </Badge>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-fade-in-up delay-100">
          {statCards.map((stat) => (
            <Card key={stat.label} hover className="p-5">
              <div className="flex items-center justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bgColor}`}>
                  <span className={stat.color}>{stat.icon}</span>
                </div>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
              <p className="mt-3 text-sm font-medium text-text-primary">{stat.label}</p>
              <p className="mt-0.5 text-xs text-text-secondary">{stat.trend}</p>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3 animate-fade-in-up delay-200">
          <Link to="/company/jobs/new">
            <Card hover className="p-5 flex items-center gap-4 border-primary/20 hover:border-primary/40 transition-colors">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-light">
                <PlusCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-text-primary">Post New Job</p>
                <p className="text-sm text-text-secondary">Create a job listing</p>
              </div>
            </Card>
          </Link>
          <Link to="/company/candidates">
            <Card hover className="p-5 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-ai-purple/10">
                <Users className="h-6 w-6 text-ai-purple" />
              </div>
              <div>
                <p className="font-semibold text-text-primary">Browse Candidates</p>
                <p className="text-sm text-text-secondary">Review applications</p>
              </div>
            </Card>
          </Link>
          <Link to="/company/pipeline">
            <Card hover className="p-5 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="font-semibold text-text-primary">Hiring Pipeline</p>
                <p className="text-sm text-text-secondary">Track progress</p>
              </div>
            </Card>
          </Link>
        </div>

        {/* Recent Applicants */}
        <Card className="mt-8 overflow-hidden animate-fade-in-up delay-300">
          <div className="flex items-center justify-between border-b border-border p-5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-ai-purple" />
              <h2 className="text-lg font-semibold text-text-primary">Recent Applicants</h2>
              <Badge variant="ai">AI Matched</Badge>
            </div>
            <Link to="/company/candidates">
              <Button variant="ghost" size="sm">
                View all <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="divide-y divide-border">
            {applicantsQuery.isLoading && (
              <div className="p-5">
                <div className="h-16 animate-pulse rounded bg-border/70" />
              </div>
            )}
            {applicants.map((a) => (
              <Link
                key={a.id}
                to={`/company/candidates/${a.id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-background/50 transition-colors"
              >
                <Avatar name={a.name} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text-primary">{a.name}</p>
                  <p className="text-sm text-text-secondary">{a.role}</p>
                </div>
                <div className="hidden sm:flex items-center gap-3">
                  <Badge 
                    variant={a.status === 'NEW' ? 'info' : a.status === 'SHORTLISTED' ? 'success' : 'neutral'}
                  >
                    {a.status === 'NEW' ? 'New' : a.status === 'SHORTLISTED' ? 'Shortlisted' : 'Reviewed'}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-text-secondary">
                    <Clock className="h-4 w-4" />
                    {a.appliedAt}
                  </div>
                </div>
                <MatchScore value={a.matchScore} size={44} />
              </Link>
            ))}
          </div>
        </Card>

        {/* Post Job CTA */}
        <div className="mt-8 relative overflow-hidden rounded-2xl bg-gradient-to-r from-ai-purple to-ai-cyan p-8 text-white animate-fade-in-up delay-400">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <div className="relative z-10">
            <h2 className="text-xl font-bold">Find Your Next Great Hire</h2>
            <p className="mt-2 text-white/80 max-w-xl">
              Post a job and let our AI match you with qualified candidates. Get personalized skill assessments for every applicant.
            </p>
            <Link to="/company/jobs/new">
              <Button variant="secondary" className="mt-6 bg-white text-ai-purple hover:bg-white/90 border-0">
                Post a Job <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
