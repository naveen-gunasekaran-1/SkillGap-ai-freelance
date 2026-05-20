import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  AlertTriangle,
  Building2,
  CheckCircle,
  Clock,
  FileText,
  ShieldCheck,
  ShieldX,
  Database,
  XCircle,
} from 'lucide-react';
import { Badge, Button, Card, Textarea } from '@skillgap/ui';
import { Navbar } from '../components/Navbar';
import { api } from '../lib/api';

type VerificationStatus =
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'VERIFIED'
  | 'REJECTED'
  | 'SUSPENDED';
type AdminTab = 'verifications' | 'audit' | 'fraud';

interface AdminCompany {
  id: string;
  name: string;
  industry: string;
  website?: string;
  isVerified: boolean;
  verificationStatus?: string;
}

interface VerificationDocument {
  id: string;
  type: string;
  originalName: string;
  contentType: string;
  sizeBytes: number;
  checksumSha256?: string | null;
  malwareScanStatus: string;
  status: string;
  createdAt: string;
}

interface FraudFlag {
  id: string;
  severity: string;
  reason: string;
  status: string;
  createdAt: string;
  company?: AdminCompany | null;
}

interface AdminReview {
  id: string;
  decision?: string | null;
  notes?: string | null;
  status: string;
  createdAt: string;
}

interface CompanyVerification {
  id: string;
  companyId: string;
  company: AdminCompany;
  status: VerificationStatus;
  region: 'INDIA' | 'GLOBAL';
  countryCode: string;
  fraudScore: number;
  rejectionReason?: string | null;
  submittedAt?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  documents: VerificationDocument[];
  fraudFlags: FraudFlag[];
  adminReviews: AdminReview[];
}

interface AuditLog {
  id: string;
  actorRole?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  ipAddress?: string | null;
  createdAt: string;
  actor?: {
    name: string;
    email: string;
    role: string;
  } | null;
}

interface StorageStatus {
  configured: boolean;
  bucketConfigured: boolean;
  accessKeyConfigured: boolean;
  secretKeyConfigured: boolean;
  endpointConfigured: boolean;
  publicUrlConfigured: boolean;
  provider: string;
}

const tabs: Array<{ id: AdminTab; label: string }> = [
  { id: 'verifications', label: 'Verification Queue' },
  { id: 'audit', label: 'Audit Logs' },
  { id: 'fraud', label: 'Fraud Flags' },
];

function statusBadge(status: string): React.JSX.Element {
  if (status === 'VERIFIED') return <Badge variant="success">Approved</Badge>;
  if (status === 'REJECTED' || status === 'SUSPENDED')
    return <Badge variant="error">{status}</Badge>;
  if (status === 'SUBMITTED' || status === 'UNDER_REVIEW')
    return <Badge variant="warning">{status.replace('_', ' ')}</Badge>;
  return <Badge variant="neutral">{status}</Badge>;
}

function formatDate(value?: string | null): string {
  if (!value) return 'Not set';
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AdminPanel(): React.JSX.Element {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab');
  const tab: AdminTab =
    currentTab === 'audit' || currentTab === 'fraud' ? currentTab : 'verifications';
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const verificationsQuery = useQuery({
    queryKey: ['admin', 'verifications'],
    queryFn: async (): Promise<CompanyVerification[]> => {
      const res = await api.get<{ verifications: CompanyVerification[] }>('/admin/verifications');
      return res.data.verifications;
    },
  });

  const selectedVerificationQuery = useQuery({
    queryKey: ['admin', 'verification', selectedId],
    enabled: Boolean(selectedId),
    queryFn: async (): Promise<CompanyVerification> => {
      const res = await api.get<{ verification: CompanyVerification }>(
        `/admin/verifications/${selectedId}`,
      );
      return res.data.verification;
    },
  });

  const auditQuery = useQuery({
    queryKey: ['admin', 'audit-logs'],
    enabled: tab === 'audit',
    queryFn: async (): Promise<AuditLog[]> => {
      const res = await api.get<{ logs: AuditLog[] }>('/admin/audit-logs');
      return res.data.logs;
    },
  });

  const fraudQuery = useQuery({
    queryKey: ['admin', 'fraud-flags'],
    enabled: tab === 'fraud',
    queryFn: async (): Promise<FraudFlag[]> => {
      const res = await api.get<{ flags: FraudFlag[] }>('/admin/fraud-flags');
      return res.data.flags;
    },
  });

  const storageQuery = useQuery({
    queryKey: ['admin', 'storage-status'],
    queryFn: async (): Promise<StorageStatus> => {
      const res = await api.get<{ storage: StorageStatus }>('/admin/storage/status');
      return res.data.storage;
    },
  });

  const verifications = verificationsQuery.data ?? [];
  const selectedVerification =
    selectedVerificationQuery.data ??
    verifications.find((item) => item.id === selectedId) ??
    verifications[0] ??
    null;

  const stats = useMemo(() => {
    const pending = verifications.filter(
      (item) => item.status === 'SUBMITTED' || item.status === 'UNDER_REVIEW',
    ).length;
    const approved = verifications.filter((item) => item.status === 'VERIFIED').length;
    const rejected = verifications.filter((item) => item.status === 'REJECTED').length;
    const docs = verifications.reduce((sum, item) => sum + item.documents.length, 0);
    return { pending, approved, rejected, docs };
  }, [verifications]);

  const decisionMutation = useMutation({
    mutationFn: async (decision: 'APPROVED' | 'REJECTED') => {
      if (!selectedVerification) throw new Error('Select a verification first');
      const res = await api.patch<{ verification: CompanyVerification }>(
        `/admin/verifications/${selectedVerification.id}/decision`,
        {
          decision,
          ...(reviewNotes.trim() ? { notes: reviewNotes.trim() } : {}),
          ...(decision === 'REJECTED' ? { rejectionReason: rejectionReason.trim() } : {}),
        },
      );
      return res.data.verification;
    },
    onSuccess: (_verification, decision) => {
      toast.success(decision === 'APPROVED' ? 'Company approved' : 'Company rejected');
      setReviewNotes('');
      setRejectionReason('');
      queryClient.invalidateQueries({ queryKey: ['admin', 'verifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'verification'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'audit-logs'] });
    },
    onError: (err: unknown) => {
      const message =
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as { response?: { data?: { message?: string } } }).response?.data?.message ===
          'string'
          ? (err as { response: { data: { message: string } } }).response.data.message
          : 'Review decision failed';
      toast.error(message);
    },
  });

  const openDocument = async (documentId: string): Promise<void> => {
    try {
      const res = await api.get<{ url: string }>(
        `/admin/verification-documents/${documentId}/read-url`,
      );
      window.open(res.data.url, '_blank', 'noopener,noreferrer');
    } catch (err: unknown) {
      const message =
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as { response?: { data?: { message?: string } } }).response?.data?.message ===
          'string'
          ? (err as { response: { data: { message: string } } }).response.data.message
          : 'Could not open document';
      toast.error(message);
    }
  };

  const canDecide =
    selectedVerification?.status === 'SUBMITTED' ||
    selectedVerification?.status === 'UNDER_REVIEW' ||
    selectedVerification?.status === 'IN_PROGRESS';

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-6 lg:py-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              Admin operations
            </p>
            <h1 className="mt-1 text-2xl font-bold text-text-primary md:text-3xl">
              Trust & Verification Console
            </h1>
            <p className="mt-2 max-w-3xl text-text-secondary">
              Review company verification submissions, inspect document metadata, monitor fraud
              flags, and keep an auditable trail of recruiter trust decisions.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {tabs.map((item) => (
              <button
                key={item.id}
                onClick={() => setSearchParams(item.id === 'verifications' ? {} : { tab: item.id })}
                className={`rounded-card px-4 py-2 text-sm font-medium transition-colors ${
                  tab === item.id
                    ? 'bg-primary text-white shadow-card'
                    : 'border border-border bg-white text-text-secondary hover:text-text-primary'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            icon={<Clock className="h-5 w-5" />}
            label="Pending review"
            value={stats.pending}
          />
          <MetricCard
            icon={<CheckCircle className="h-5 w-5" />}
            label="Approved"
            value={stats.approved}
            tone="success"
          />
          <MetricCard
            icon={<XCircle className="h-5 w-5" />}
            label="Rejected"
            value={stats.rejected}
            tone="error"
          />
          <MetricCard
            icon={<FileText className="h-5 w-5" />}
            label="Documents"
            value={stats.docs}
            tone="ai"
          />
        </div>

        <Card className="mt-6 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-card bg-primary-light text-primary">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold text-text-primary">Storage configuration</h2>
                <p className="mt-1 text-sm text-text-secondary">
                  Cloudflare R2 or S3-compatible storage is required for verification document
                  uploads.
                </p>
              </div>
            </div>
            <Badge variant={storageQuery.data?.configured ? 'success' : 'warning'}>
              {storageQuery.isLoading
                ? 'Checking'
                : storageQuery.data?.configured
                  ? 'Configured'
                  : 'Needs setup'}
            </Badge>
          </div>
        </Card>

        {tab === 'verifications' && (
          <div className="mt-8 grid gap-6 lg:grid-cols-[420px_1fr]">
            <Card className="overflow-hidden">
              <div className="border-b border-border p-5">
                <h2 className="font-semibold text-text-primary">Company submissions</h2>
                <p className="mt-1 text-sm text-text-secondary">Newest submissions appear first.</p>
              </div>
              <div className="max-h-[680px] overflow-y-auto divide-y divide-border">
                {verificationsQuery.isLoading && (
                  <div className="p-5 text-sm text-text-secondary">Loading queue...</div>
                )}
                {!verificationsQuery.isLoading && verifications.length === 0 && (
                  <div className="p-5 text-sm text-text-secondary">
                    No verification submissions yet.
                  </div>
                )}
                {verifications.map((verification) => (
                  <button
                    key={verification.id}
                    onClick={() => setSelectedId(verification.id)}
                    className={`flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-background ${
                      selectedVerification?.id === verification.id ? 'bg-primary-light/50' : ''
                    }`}
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-card bg-white text-primary shadow-card">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate font-semibold text-text-primary">
                          {verification.company.name}
                        </p>
                        {statusBadge(verification.status)}
                      </div>
                      <p className="mt-1 text-sm text-text-secondary">
                        {verification.region} · {verification.countryCode} ·{' '}
                        {verification.documents.length} documents
                      </p>
                      <p className="mt-1 text-xs text-text-secondary">
                        Created {formatDate(verification.createdAt)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            <VerificationDetail
              verification={selectedVerification}
              notes={reviewNotes}
              rejectionReason={rejectionReason}
              canDecide={Boolean(canDecide)}
              loading={decisionMutation.isPending || selectedVerificationQuery.isFetching}
              onNotesChange={setReviewNotes}
              onRejectionReasonChange={setRejectionReason}
              onApprove={() => decisionMutation.mutate('APPROVED')}
              onReject={() => decisionMutation.mutate('REJECTED')}
              onOpenDocument={(documentId) => void openDocument(documentId)}
            />
          </div>
        )}

        {tab === 'audit' && (
          <Card className="mt-8 overflow-hidden">
            <div className="border-b border-border p-5">
              <h2 className="font-semibold text-text-primary">Audit trail</h2>
              <p className="mt-1 text-sm text-text-secondary">
                Most recent sensitive platform actions.
              </p>
            </div>
            <div className="divide-y divide-border">
              {(auditQuery.data ?? []).map((log) => (
                <div
                  key={log.id}
                  className="grid gap-3 p-4 md:grid-cols-[1fr_180px_140px] md:items-center"
                >
                  <div>
                    <p className="font-medium text-text-primary">{log.action}</p>
                    <p className="text-sm text-text-secondary">
                      {log.entityType}
                      {log.entityId ? ` · ${log.entityId}` : ''} ·{' '}
                      {log.actor?.email ?? log.actorRole ?? 'System'}
                    </p>
                  </div>
                  <p className="text-sm text-text-secondary">{log.ipAddress ?? 'IP unavailable'}</p>
                  <p className="text-sm text-text-secondary">{formatDate(log.createdAt)}</p>
                </div>
              ))}
              {auditQuery.isLoading && (
                <div className="p-5 text-sm text-text-secondary">Loading audit logs...</div>
              )}
              {!auditQuery.isLoading && (auditQuery.data ?? []).length === 0 && (
                <div className="p-5 text-sm text-text-secondary">No audit logs yet.</div>
              )}
            </div>
          </Card>
        )}

        {tab === 'fraud' && (
          <Card className="mt-8 overflow-hidden">
            <div className="border-b border-border p-5">
              <h2 className="font-semibold text-text-primary">Fraud flags</h2>
              <p className="mt-1 text-sm text-text-secondary">
                Signals requiring admin investigation.
              </p>
            </div>
            <div className="divide-y divide-border">
              {(fraudQuery.data ?? []).map((flag) => (
                <div
                  key={flag.id}
                  className="grid gap-3 p-4 md:grid-cols-[1fr_120px_140px] md:items-center"
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 text-warning" />
                    <div>
                      <p className="font-medium text-text-primary">{flag.reason}</p>
                      <p className="text-sm text-text-secondary">
                        {flag.company?.name ?? 'Unknown company'}
                      </p>
                    </div>
                  </div>
                  <Badge variant={flag.severity === 'HIGH' ? 'error' : 'warning'}>
                    {flag.severity}
                  </Badge>
                  <p className="text-sm text-text-secondary">{formatDate(flag.createdAt)}</p>
                </div>
              ))}
              {fraudQuery.isLoading && (
                <div className="p-5 text-sm text-text-secondary">Loading fraud flags...</div>
              )}
              {!fraudQuery.isLoading && (fraudQuery.data ?? []).length === 0 && (
                <div className="p-5 text-sm text-text-secondary">
                  No fraud flags currently open.
                </div>
              )}
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  tone = 'primary',
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone?: 'primary' | 'success' | 'error' | 'ai';
}): React.JSX.Element {
  const tones = {
    primary: 'bg-primary-light text-primary',
    success: 'bg-success/10 text-success',
    error: 'bg-error/10 text-error',
    ai: 'bg-gradient-to-r from-ai-purple to-ai-cyan text-white',
  };
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-text-secondary">{label}</p>
          <p className="mt-2 text-2xl font-bold text-text-primary">{value}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-card ${tones[tone]}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

function VerificationDetail({
  verification,
  notes,
  rejectionReason,
  canDecide,
  loading,
  onNotesChange,
  onRejectionReasonChange,
  onApprove,
  onReject,
  onOpenDocument,
}: {
  verification: CompanyVerification | null;
  notes: string;
  rejectionReason: string;
  canDecide: boolean;
  loading: boolean;
  onNotesChange: (value: string) => void;
  onRejectionReasonChange: (value: string) => void;
  onApprove: () => void;
  onReject: () => void;
  onOpenDocument: (documentId: string) => void;
}): React.JSX.Element {
  if (!verification) {
    return (
      <Card className="flex min-h-[520px] items-center justify-center p-8 text-center">
        <div>
          <ShieldCheck className="mx-auto h-10 w-10 text-text-secondary" />
          <h2 className="mt-4 font-semibold text-text-primary">No verification selected</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Select a company submission to review documents.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <div className="flex flex-col gap-4 border-b border-border pb-5 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-text-primary">{verification.company.name}</h2>
            {statusBadge(verification.status)}
          </div>
          <p className="mt-1 text-sm text-text-secondary">
            {verification.company.industry} · {verification.region} · {verification.countryCode}
          </p>
          {verification.company.website && (
            <a
              href={verification.company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
            >
              {verification.company.website}
            </a>
          )}
        </div>
        <div className="rounded-card border border-border bg-background px-4 py-3 text-sm text-text-secondary">
          <p>Submitted: {formatDate(verification.submittedAt)}</p>
          <p>Fraud score: {verification.fraudScore}/100</p>
        </div>
      </div>

      <div className="mt-5">
        <h3 className="font-semibold text-text-primary">Document metadata</h3>
        <div className="mt-3 grid gap-3">
          {verification.documents.map((doc) => (
            <div key={doc.id} className="rounded-card border border-border bg-background p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-3">
                  <FileText className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-text-primary">{doc.type.replaceAll('_', ' ')}</p>
                    <p className="text-sm text-text-secondary">{doc.originalName}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="info">{formatBytes(doc.sizeBytes)}</Badge>
                  <Badge variant={doc.malwareScanStatus === 'PENDING' ? 'warning' : 'success'}>
                    Scan {doc.malwareScanStatus}
                  </Badge>
                  <Badge variant="neutral">{doc.status}</Badge>
                  <Button size="sm" variant="secondary" onClick={() => onOpenDocument(doc.id)}>
                    Open securely
                  </Button>
                </div>
              </div>
              {doc.checksumSha256 && (
                <p className="mt-3 break-all rounded-card bg-white px-3 py-2 text-xs text-text-secondary">
                  SHA-256: {doc.checksumSha256}
                </p>
              )}
            </div>
          ))}
          {verification.documents.length === 0 && (
            <div className="rounded-card border border-border bg-background p-4 text-sm text-text-secondary">
              No documents uploaded.
            </div>
          )}
        </div>
      </div>

      {verification.rejectionReason && (
        <div className="mt-5 rounded-card border border-error/20 bg-error/10 p-4 text-sm text-error">
          Previous rejection: {verification.rejectionReason}
        </div>
      )}

      <div className="mt-6 grid gap-4">
        <Textarea
          label="Admin notes"
          rows={3}
          value={notes}
          onChange={(event) => onNotesChange(event.target.value)}
          placeholder="Internal review notes, document observations, or compliance context..."
        />
        <Textarea
          label="Rejection reason"
          rows={3}
          value={rejectionReason}
          onChange={(event) => onRejectionReasonChange(event.target.value)}
          placeholder="Required only when rejecting. This should explain exactly what the company must fix."
        />
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button
          variant="danger"
          disabled={!canDecide || loading || rejectionReason.trim().length < 10}
          onClick={onReject}
        >
          <ShieldX className="mr-2 h-4 w-4" />
          Reject verification
        </Button>
        <Button disabled={!canDecide || loading} loading={loading} onClick={onApprove}>
          <ShieldCheck className="mr-2 h-4 w-4" />
          Approve company
        </Button>
      </div>
    </Card>
  );
}
