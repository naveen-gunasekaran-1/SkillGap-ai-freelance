import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { CheckCircle, FileText, ShieldCheck, UploadCloud } from 'lucide-react';
import { Badge, Button, Card } from '@skillgap/ui';
import { AppShell } from '../../components/AppShell';
import { api } from '../../lib/api';

type VerificationStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'VERIFIED'
  | 'REJECTED'
  | 'SUSPENDED';

interface VerificationDocument {
  id: string;
  type: string;
  originalName: string;
  status: string;
  malwareScanStatus: string;
  createdAt: string;
}

interface CompanyVerification {
  id: string;
  status: VerificationStatus;
  region: 'INDIA' | 'GLOBAL';
  countryCode: string;
  rejectionReason?: string | null;
  documents: VerificationDocument[];
}

interface VerificationResponse {
  company: {
    isVerified: boolean;
    verificationStatus?: VerificationStatus;
  };
  verification?: CompanyVerification | null;
  requiredDocuments: string[];
}

const labels: Record<string, string> = {
  GST_CERTIFICATE: 'GST certificate',
  PAN: 'PAN',
  CIN: 'CIN',
  CERTIFICATE_OF_INCORPORATION: 'Certificate of incorporation',
  ADDRESS_PROOF: 'Address proof',
  BUSINESS_REGISTRATION: 'Business registration',
  TAX_DOCUMENT: 'Tax document',
  BUSINESS_LICENSE: 'Business license',
};

export function CompanyVerificationPage(): React.JSX.Element {
  const queryClient = useQueryClient();
  const [region, setRegion] = useState<'INDIA' | 'GLOBAL'>('INDIA');
  const [countryCode, setCountryCode] = useState('IN');
  const [files, setFiles] = useState<Record<string, File | null>>({});

  const verificationQuery = useQuery({
    queryKey: ['company', 'verification'],
    queryFn: async (): Promise<VerificationResponse> => {
      const res = await api.get<VerificationResponse>('/companies/me/verification');
      return res.data;
    },
  });

  const verification = verificationQuery.data?.verification ?? null;
  const requiredDocuments = verificationQuery.data?.requiredDocuments ?? [];
  const uploadedTypes = new Set(verification?.documents.map((doc) => doc.type) ?? []);
  const status =
    verification?.status ?? verificationQuery.data?.company.verificationStatus ?? 'NOT_STARTED';

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/companies/me/verification', { region, countryCode });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Verification workspace created');
      queryClient.invalidateQueries({ queryKey: ['company', 'verification'] });
    },
    onError: () => toast.error('Could not start verification'),
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ type, file }: { type: string; file: File }) => {
      if (!verification) throw new Error('Start verification first');
      const formData = new FormData();
      formData.append('type', type);
      formData.append('verificationId', verification.id);
      formData.append('file', file);
      const res = await api.post('/companies/me/verification/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Document uploaded');
      queryClient.invalidateQueries({ queryKey: ['company', 'verification'] });
    },
    onError: (err: unknown) => {
      const message =
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as { response?: { data?: { message?: string } } }).response?.data?.message ===
          'string'
          ? (err as { response: { data: { message: string } } }).response.data.message
          : 'Document upload failed';
      toast.error(message);
    },
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!verification) throw new Error('Start verification first');
      const res = await api.post('/companies/me/verification/submit', {
        verificationId: verification.id,
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Verification submitted for admin review');
      queryClient.invalidateQueries({ queryKey: ['company', 'verification'] });
    },
    onError: (err: unknown) => {
      const message =
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as { response?: { data?: { message?: string } } }).response?.data?.message ===
          'string'
          ? (err as { response: { data: { message: string } } }).response.data.message
          : 'Submission failed';
      toast.error(message);
    },
  });

  return (
    <AppShell>
      <main className="mx-auto max-w-6xl p-4 lg:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              Enterprise trust
            </p>
            <h1 className="mt-1 text-2xl font-bold text-text-primary md:text-3xl">
              Company Verification
            </h1>
            <p className="mt-2 max-w-2xl text-text-secondary">
              Verified companies can post jobs, access candidate data, and use hiring analytics.
              Documents are stored as private verification records for admin review.
            </p>
          </div>
          <Badge
            variant={
              status === 'VERIFIED' ? 'success' : status === 'REJECTED' ? 'error' : 'warning'
            }
          >
            {status.replaceAll('_', ' ')}
          </Badge>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[360px_1fr]">
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-card bg-primary-light text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold text-text-primary">Verification setup</h2>
                <p className="text-sm text-text-secondary">
                  Choose the required document checklist.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <label className="block text-sm font-medium text-text-primary">
                Region
                <select
                  value={region}
                  onChange={(event) => {
                    const next = event.target.value as 'INDIA' | 'GLOBAL';
                    setRegion(next);
                    setCountryCode(next === 'INDIA' ? 'IN' : 'US');
                  }}
                  className="mt-2 h-11 w-full rounded-card border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  disabled={Boolean(verification)}
                >
                  <option value="INDIA">India</option>
                  <option value="GLOBAL">Global</option>
                </select>
              </label>
              <label className="block text-sm font-medium text-text-primary">
                Country code
                <input
                  value={countryCode}
                  onChange={(event) => setCountryCode(event.target.value.toUpperCase().slice(0, 2))}
                  className="mt-2 h-11 w-full rounded-card border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  disabled={Boolean(verification)}
                />
              </label>
              {!verification && (
                <Button
                  className="w-full"
                  onClick={() => createMutation.mutate()}
                  loading={createMutation.isPending}
                >
                  Start verification
                </Button>
              )}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-semibold text-text-primary">Required documents</h2>
                <p className="mt-1 text-sm text-text-secondary">
                  Upload every required item before submitting.
                </p>
              </div>
              {status === 'VERIFIED' && <CheckCircle className="h-6 w-6 text-success" />}
            </div>

            <div className="mt-5 space-y-3">
              {requiredDocuments.map((type) => {
                const uploaded = uploadedTypes.has(type);
                return (
                  <div key={type} className="rounded-card border border-border bg-background p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-3">
                        <FileText
                          className={
                            uploaded
                              ? 'mt-0.5 h-5 w-5 text-success'
                              : 'mt-0.5 h-5 w-5 text-text-secondary'
                          }
                        />
                        <div>
                          <p className="font-medium text-text-primary">{labels[type] ?? type}</p>
                          <p className="text-sm text-text-secondary">
                            {uploaded
                              ? 'Uploaded and waiting for admin review.'
                              : 'PDF, JPG, or PNG up to 6MB.'}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 sm:min-w-72">
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                          disabled={
                            !verification || status === 'SUBMITTED' || status === 'VERIFIED'
                          }
                          onChange={(event) =>
                            setFiles((current) => ({
                              ...current,
                              [type]: event.target.files?.[0] ?? null,
                            }))
                          }
                          className="text-sm text-text-secondary file:mr-3 file:rounded-card file:border-0 file:bg-white file:px-3 file:py-2 file:text-sm file:font-medium file:text-text-primary"
                        />
                        <Button
                          size="sm"
                          variant={uploaded ? 'secondary' : 'primary'}
                          disabled={
                            !verification ||
                            !files[type] ||
                            status === 'SUBMITTED' ||
                            status === 'VERIFIED'
                          }
                          loading={uploadMutation.isPending}
                          onClick={() => {
                            const file = files[type];
                            if (file) uploadMutation.mutate({ type, file });
                          }}
                        >
                          <UploadCloud className="mr-2 h-4 w-4" />
                          {uploaded ? 'Replace document' : 'Upload'}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {status === 'REJECTED' && verification?.rejectionReason && (
              <div className="mt-5 rounded-card border border-error/20 bg-error/10 p-4 text-sm text-error">
                {verification.rejectionReason}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <Button
                variant="ai-gradient"
                disabled={!verification || status === 'SUBMITTED' || status === 'VERIFIED'}
                loading={submitMutation.isPending}
                onClick={() => submitMutation.mutate()}
              >
                Submit for review
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </AppShell>
  );
}
