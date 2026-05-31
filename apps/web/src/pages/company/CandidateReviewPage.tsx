import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Avatar, Badge, Button, Card, MatchScore, Textarea } from '@skillgap/ui';
import {
  AlertTriangle,
  Brain,
  CheckCircle2,
  Search,
  SlidersHorizontal,
  Sparkles,
  UserCheck,
  UserX,
  X,
} from 'lucide-react';
import type { Application, ApplicationStatus, RejectionCategory } from '@skillgap/types';
import { AppShell } from '../../components/AppShell';
import { VerificationRequiredCard } from '../../components/VerificationRequiredCard';
import { api } from '../../lib/api';
import { parseApplication } from '../../lib/normalize';
import { useCompanyTrust } from '../../hooks/useCompanyTrust';

const rejectionCategories: RejectionCategory[] = [
  'Technical Skills',
  'Communication',
  'Experience Gap',
  'Domain Knowledge',
  'Leadership',
  'Culture Fit',
  'System Design',
  'DevOps',
  'Security',
  'Architecture',
];

export function CandidateReviewPage(): React.JSX.Element {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<RejectionCategory[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [evidenceNotes, setEvidenceNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const queryClient = useQueryClient();
  const companyQuery = useCompanyTrust();
  const isVerified = Boolean(
    companyQuery.data?.isVerified && companyQuery.data.verificationStatus === 'VERIFIED',
  );
  const applicationsQuery = useQuery({
    queryKey: ['company', 'applications'],
    enabled: isVerified,
    queryFn: async (): Promise<Application[]> => {
      const res = await api.get<{ applications: unknown[] }>('/applications');
      return res.data.applications.map(parseApplication);
    },
  });
  const updateStatus = useMutation({
    mutationFn: async ({
      id,
      status,
      rejectionReason,
      rejectionCategories,
      missingSkills,
      evidenceNotes,
    }: {
      id: string;
      status: ApplicationStatus;
      rejectionReason?: string;
      rejectionCategories?: RejectionCategory[];
      missingSkills?: string[];
      evidenceNotes?: string;
    }) => {
      const body =
        status === 'REJECTED'
          ? { status, rejectionReason, rejectionCategories, missingSkills, evidenceNotes }
          : { status };
      return api.patch(`/applications/${id}/status`, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company', 'applications'] });
      setSelectedApplication(null);
      setSelectedCategories([]);
      setSelectedSkills([]);
      setEvidenceNotes('');
      setRejectionReason('');
      toast.success('Candidate status updated');
    },
    onError: () => toast.error('Could not update candidate status'),
  });
  const applicants = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return (applicationsQuery.data ?? []).filter((app) => {
      const haystack =
        `${app.candidate?.name ?? ''} ${app.candidate?.title ?? ''} ${app.job?.title ?? ''} ${(app.candidate?.skills ?? []).join(' ')}`.toLowerCase();
      return !needle || haystack.includes(needle);
    });
  }, [applicationsQuery.data, search]);

  const openRejectModal = (application: Application) => {
    const gapExplanation = application.aiExplanations?.find((e) => e.type === 'GAP_REPORT');
    const inferredSkills = [
      ...(gapExplanation?.missingSkills ?? []),
      ...(gapExplanation?.weakEvidence ?? []),
      ...(application.gapReport?.criticalGaps ?? []),
      ...(application.gapReport?.partialMatches ?? []),
    ].map((gap) => gap.skillName);
    setSelectedApplication(application);
    setSelectedCategories([]);
    setSelectedSkills(Array.from(new Set(inferredSkills)).slice(0, 3));
    setEvidenceNotes('');
    setRejectionReason('');
  };

  const toggleCategory = (category: RejectionCategory) => {
    setSelectedCategories((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category],
    );
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills((current) =>
      current.includes(skill) ? current.filter((item) => item !== skill) : [...current, skill],
    );
  };

  const submitRejection = () => {
    if (!selectedApplication) return;
    if (selectedCategories.length === 0) {
      toast.error('Select at least one rejection category');
      return;
    }
    if (rejectionReason.trim().length < 30) {
      toast.error('Add a candidate-facing explanation with at least 30 characters');
      return;
    }
    updateStatus.mutate({
      id: selectedApplication.id,
      status: 'REJECTED',
      rejectionReason: rejectionReason.trim(),
      rejectionCategories: selectedCategories,
      missingSkills: selectedSkills,
      ...(evidenceNotes.trim() ? { evidenceNotes: evidenceNotes.trim() } : {}),
    });
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl p-4 lg:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary md:text-3xl">Candidate Review</h1>
            <p className="mt-1 text-text-secondary">
              Review applicants by match score, skills, and hiring status.
            </p>
          </div>
          <Button variant="secondary">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>

        {!isVerified && (
          <div className="mt-6">
            <VerificationRequiredCard description="Candidate review is locked until your company verification is approved by an admin." />
          </div>
        )}

        {isVerified && (
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
        )}

        {isVerified && (
          <div className="mt-6 grid gap-4">
            {applicationsQuery.isLoading && <Card className="p-5">Loading candidates...</Card>}
            {applicants.map((application) => {
              const candidate = application.candidate;
              const skills = candidate?.skills ?? [];
              const gapExplanation = application.aiExplanations?.find(
                (e) => e.type === 'GAP_REPORT',
              );
              const topGaps = [
                ...(gapExplanation?.missingSkills ?? []),
                ...(gapExplanation?.weakEvidence ?? []),
                ...(application.gapReport?.criticalGaps ?? []),
                ...(application.gapReport?.partialMatches ?? []),
              ].slice(0, 4);
              return (
                <Card key={application.id} className="p-5">
                  <div className="flex flex-col gap-5 md:flex-row md:items-start">
                    <div className="flex flex-1 items-center gap-4">
                      <Avatar
                        name={candidate?.name ?? 'Candidate'}
                        src={candidate?.avatar}
                        size="lg"
                      />
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-semibold text-text-primary">
                            {candidate?.name ?? 'Candidate'}
                          </h2>
                          <Badge
                            variant={
                              application.status === 'SHORTLISTED'
                                ? 'success'
                                : application.status === 'APPLIED'
                                  ? 'info'
                                  : 'neutral'
                            }
                          >
                            {application.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-text-secondary">
                          {candidate?.title || application.job?.title || 'Applicant'}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {skills.slice(0, 5).map((skill) => (
                            <span
                              key={skill}
                              className="rounded-full bg-primary-light px-2.5 py-1 text-xs font-medium text-primary"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 md:justify-end">
                      <MatchScore value={application.matchScore} size={72} />
                      <div className="hidden min-w-32 text-sm text-text-secondary sm:block">
                        Job: {application.job?.title ?? 'Role'}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          disabled={updateStatus.isPending}
                          onClick={() =>
                            updateStatus.mutate({ id: application.id, status: 'SHORTLISTED' })
                          }
                        >
                          <UserCheck className="mr-2 h-4 w-4" />
                          Shortlist
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={updateStatus.isPending}
                          onClick={() => openRejectModal(application)}
                        >
                          <UserX className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 grid gap-4 border-t border-border pt-5 lg:grid-cols-[1fr_280px]">
                    <div>
                      <div className="mb-3 flex items-center gap-2">
                        <Brain className="h-4 w-4 text-ai-purple" />
                        <p className="text-sm font-semibold text-text-primary">Evidence gaps</p>
                      </div>
                      {topGaps.length > 0 ? (
                        <div className="grid gap-2 sm:grid-cols-2">
                          {topGaps.map((gap) => (
                            <div
                              key={`${application.id}-${gap.skillName}`}
                              className="rounded-card border border-border bg-background/70 p-3"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-semibold text-text-primary">
                                  {gap.skillName}
                                </p>
                                <Badge
                                  variant={
                                    gap.severity === 'CRITICAL'
                                      ? 'error'
                                      : gap.severity === 'MODERATE'
                                        ? 'warning'
                                        : 'neutral'
                                  }
                                >
                                  {gap.severity}
                                </Badge>
                              </div>
                              <p className="mt-1 line-clamp-2 text-xs text-text-secondary">
                                {gap.explanation}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="rounded-card border border-dashed border-border p-3 text-sm text-text-secondary">
                          No AI evidence gaps available yet for this candidate.
                        </p>
                      )}
                    </div>
                    <div className="rounded-card border border-ai-purple/20 bg-primary-light/40 p-4">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-ai-purple" />
                        <p className="text-sm font-semibold text-text-primary">AI confidence</p>
                      </div>
                      <p className="mt-2 text-2xl font-bold text-primary">
                        {gapExplanation?.confidence ?? application.matchScore}%
                      </p>
                      <p className="mt-1 text-xs text-text-secondary">
                        {gapExplanation?.summary ??
                          'Match score generated from candidate skills and job requirements.'}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
            {!applicationsQuery.isLoading && applicants.length === 0 && (
              <Card className="p-8 text-center text-text-secondary">No applicants found.</Card>
            )}
          </div>
        )}

        {selectedApplication && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
            <Card className="max-h-[90vh] w-full max-w-3xl overflow-y-auto p-6 shadow-elevated">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-text-primary">Structured rejection</h2>
                  <p className="mt-1 text-sm text-text-secondary">
                    Rejections require clear categories, evidence, and candidate-facing feedback.
                  </p>
                </div>
                <button
                  type="button"
                  className="rounded-lg p-2 text-text-secondary hover:bg-background hover:text-text-primary"
                  onClick={() => setSelectedApplication(null)}
                  aria-label="Close rejection form"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6 rounded-card border border-warning/20 bg-warning/5 p-4">
                <div className="flex gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 text-warning" />
                  <div>
                    <p className="text-sm font-semibold text-text-primary">
                      Candidate-facing accountability
                    </p>
                    <p className="mt-1 text-sm text-text-secondary">
                      This explanation will be stored in the audit trail and shown to the candidate
                      as improvement guidance.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-sm font-semibold text-text-primary">Reason categories</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {rejectionCategories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => toggleCategory(category)}
                      className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                        selectedCategories.includes(category)
                          ? 'border-primary bg-primary text-white'
                          : 'border-border bg-white text-text-secondary hover:border-primary/40 hover:text-primary'
                      }`}
                    >
                      {selectedCategories.includes(category) && (
                        <CheckCircle2 className="mr-1 inline h-3.5 w-3.5" />
                      )}
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <p className="text-sm font-semibold text-text-primary">Missing or weak evidence</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[
                    ...(selectedApplication.aiExplanations?.find((e) => e.type === 'GAP_REPORT')
                      ?.missingSkills ?? []),
                    ...(selectedApplication.aiExplanations?.find((e) => e.type === 'GAP_REPORT')
                      ?.weakEvidence ?? []),
                    ...(selectedApplication.gapReport?.criticalGaps ?? []),
                    ...(selectedApplication.gapReport?.partialMatches ?? []),
                  ]
                    .map((gap) => gap.skillName)
                    .filter((skill, index, all) => all.indexOf(skill) === index)
                    .slice(0, 10)
                    .map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                          selectedSkills.includes(skill)
                            ? 'border-ai-purple bg-ai-purple text-white'
                            : 'border-border bg-white text-text-secondary hover:border-ai-purple/40 hover:text-ai-purple'
                        }`}
                      >
                        {selectedSkills.includes(skill) && (
                          <CheckCircle2 className="mr-1 inline h-3.5 w-3.5" />
                        )}
                        {skill}
                      </button>
                    ))}
                </div>
              </div>

              <div className="mt-6 grid gap-4">
                <Textarea
                  label="Evidence notes"
                  placeholder="Example: Resume did not show production Docker deployments, CI/CD ownership, or cloud release experience."
                  value={evidenceNotes}
                  onChange={(event) => setEvidenceNotes(event.target.value)}
                />
                <Textarea
                  label="Candidate-facing explanation"
                  placeholder="Explain the decision clearly and professionally. Include what evidence was missing and what the candidate can improve next."
                  value={rejectionReason}
                  onChange={(event) => setRejectionReason(event.target.value)}
                />
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setSelectedApplication(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="ai-gradient"
                  disabled={updateStatus.isPending}
                  onClick={submitRejection}
                >
                  {updateStatus.isPending ? 'Saving...' : 'Reject with explanation'}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  );
}
