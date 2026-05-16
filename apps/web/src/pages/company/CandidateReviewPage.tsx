import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Avatar, Badge, Button, Card, MatchScore } from '@skillgap/ui';
import { Search, SlidersHorizontal, UserCheck, UserX } from 'lucide-react';
import type { Application, ApplicationStatus } from '@skillgap/types';
import { AppShell } from '../../components/AppShell';
import { api } from '../../lib/api';
import { parseApplication } from '../../lib/normalize';

export function CandidateReviewPage(): React.JSX.Element {
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();
  const applicationsQuery = useQuery({
    queryKey: ['company', 'applications'],
    queryFn: async (): Promise<Application[]> => {
      const res = await api.get<{ applications: unknown[] }>('/applications');
      return res.data.applications.map(parseApplication);
    },
  });
  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ApplicationStatus }) => {
      const body = status === 'REJECTED' ? { status, rejectionReason: 'Not selected for this role at this time.' } : { status };
      return api.patch(`/applications/${id}/status`, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company', 'applications'] });
      toast.success('Candidate status updated');
    },
    onError: () => toast.error('Could not update candidate status'),
  });
  const applicants = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return (applicationsQuery.data ?? []).filter((app) => {
      const haystack = `${app.candidate?.name ?? ''} ${app.candidate?.title ?? ''} ${app.job?.title ?? ''} ${(app.candidate?.skills ?? []).join(' ')}`.toLowerCase();
      return !needle || haystack.includes(needle);
    });
  }, [applicationsQuery.data, search]);

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl p-4 lg:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary md:text-3xl">Candidate Review</h1>
            <p className="mt-1 text-text-secondary">Review applicants by match score, skills, and hiring status.</p>
          </div>
          <Button variant="secondary">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>

        <div className="mt-6 rounded-card border border-border bg-white p-3 shadow-card">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 w-full rounded-card border border-border bg-background pl-10 pr-4 text-sm outline-none focus:border-primary"
              placeholder="Search candidates, roles, or skills"
            />
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          {applicationsQuery.isLoading && <Card className="p-5">Loading candidates...</Card>}
          {applicants.map((application) => {
            const candidate = application.candidate;
            const skills = candidate?.skills ?? [];
            return (
            <Card key={application.id} className="p-5">
              <div className="flex flex-col gap-5 md:flex-row md:items-center">
                <div className="flex flex-1 items-center gap-4">
                  <Avatar name={candidate?.name ?? 'Candidate'} size="lg" />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-text-primary">{candidate?.name ?? 'Candidate'}</h2>
                      <Badge variant={application.status === 'SHORTLISTED' ? 'success' : application.status === 'APPLIED' ? 'info' : 'neutral'}>
                        {application.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-text-secondary">{candidate?.title || application.job?.title || 'Applicant'}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {skills.slice(0, 5).map((skill) => (
                        <span key={skill} className="rounded-full bg-primary-light px-2.5 py-1 text-xs font-medium text-primary">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <MatchScore value={application.matchScore} size={72} />
                  <div className="hidden min-w-32 text-sm text-text-secondary sm:block">
                    Job: {application.job?.title ?? 'Role'}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" disabled={updateStatus.isPending} onClick={() => updateStatus.mutate({ id: application.id, status: 'SHORTLISTED' })}>
                      <UserCheck className="mr-2 h-4 w-4" />
                      Shortlist
                    </Button>
                    <Button size="sm" variant="secondary" disabled={updateStatus.isPending} onClick={() => updateStatus.mutate({ id: application.id, status: 'REJECTED' })}>
                      <UserX className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
          })}
          {!applicationsQuery.isLoading && applicants.length === 0 && <Card className="p-8 text-center text-text-secondary">No applicants found.</Card>}
        </div>
      </div>
    </AppShell>
  );
}
