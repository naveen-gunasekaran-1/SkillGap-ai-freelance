import { useQuery } from '@tanstack/react-query';
import { Avatar, Badge, Card } from '@skillgap/ui';
import type { Application, ApplicationStatus } from '@skillgap/types';
import { AppShell } from '../../components/AppShell';
import { VerificationRequiredCard } from '../../components/VerificationRequiredCard';
import { api } from '../../lib/api';
import { parseApplication } from '../../lib/normalize';
import { useCompanyTrust } from '../../hooks/useCompanyTrust';

const stageConfig: Array<{ name: string; statuses: ApplicationStatus[] }> = [
  { name: 'New', statuses: ['APPLIED', 'UNDER_REVIEW'] },
  { name: 'Shortlisted', statuses: ['SHORTLISTED'] },
  { name: 'Interview', statuses: ['INTERVIEW_SCHEDULED', 'INTERVIEW_DONE'] },
  { name: 'Offer', statuses: ['OFFER_EXTENDED', 'HIRED'] },
];

export function HiringPipelinePage(): React.JSX.Element {
  const companyQuery = useCompanyTrust();
  const isVerified = Boolean(companyQuery.data?.isVerified && companyQuery.data.verificationStatus === 'VERIFIED');
  const applicationsQuery = useQuery({
    queryKey: ['company', 'applications'],
    enabled: isVerified,
    queryFn: async (): Promise<Application[]> => {
      const res = await api.get<{ applications: unknown[] }>('/applications');
      return res.data.applications.map(parseApplication);
    },
  });
  const applications = applicationsQuery.data ?? [];
  const stages = stageConfig.map((stage) => ({
    ...stage,
    candidates: applications.filter((app) => stage.statuses.includes(app.status)),
  }));

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl p-4 lg:p-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary md:text-3xl">Hiring Pipeline</h1>
          <p className="mt-1 text-text-secondary">Track candidates through each hiring stage.</p>
        </div>

        {!isVerified && (
          <div className="mt-6">
            <VerificationRequiredCard description="Hiring pipeline analytics are available after company verification is approved." />
          </div>
        )}

        {isVerified && <div className="mt-6 grid gap-4 lg:grid-cols-4">
          {stages.map((stage) => (
            <section key={stage.name} className="rounded-card border border-border bg-background/70 p-3">
              <div className="mb-3 flex items-center justify-between px-1">
                <h2 className="font-semibold text-text-primary">{stage.name}</h2>
                <Badge variant="neutral">{stage.candidates.length}</Badge>
              </div>
              <div className="space-y-3">
                {stage.candidates.map((application) => (
                  <Card key={application.id} className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={application.candidate?.name ?? 'Candidate'} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-text-primary">{application.candidate?.name ?? 'Candidate'}</p>
                        <p className="truncate text-xs text-text-secondary">{application.job?.title ?? 'Applicant'}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="text-text-secondary">Match score</span>
                      <span className="font-semibold text-primary">{application.matchScore}%</span>
                    </div>
                  </Card>
                ))}
                {stage.candidates.length === 0 && (
                  <div className="rounded-card border border-dashed border-border p-6 text-center text-sm text-text-secondary">
                    No candidates
                  </div>
                )}
              </div>
            </section>
          ))}
        </div>}
      </div>
    </AppShell>
  );
}
