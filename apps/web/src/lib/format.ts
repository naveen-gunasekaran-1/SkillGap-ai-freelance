import type { ApplicationStatus, Job } from '@skillgap/types';

/**
 * Format salary range for display (internship uses hourly-style numbers from seed).
 */
export function formatJobSalary(job: Job): string {
  const a = job.salaryMin;
  const b = job.salaryMax;
  if (a == null && b == null) return 'Competitive';
  if (job.type === 'INTERNSHIP') {
    return `$${a ?? '—'}–${b ?? '—'} / hr`;
  }
  const k = (n: number) => `$${Math.round(n / 1000)}k`;
  if (a != null && b != null) return `${k(a)} – ${k(b)}`;
  if (a != null) return `${k(a)}+`;
  if (b != null) return `Up to ${k(b)}`;
  return 'Competitive';
}

/**
 * Human-readable relative time for job postings.
 */
export function formatPosted(date: Date): string {
  const diff = Date.now() - date.getTime();
  const days = Math.floor(diff / (86400 * 1000));
  if (days <= 0) return 'Posted today';
  if (days === 1) return 'Posted yesterday';
  if (days < 7) return `Posted ${days} days ago`;
  if (days < 30) return `Posted ${Math.floor(days / 7)} weeks ago`;
  return `Posted ${Math.floor(days / 30)} months ago`;
}

/**
 * Map API application status to UI badge variant + label.
 */
export function applicationStatusPresentation(status: ApplicationStatus): {
  label: string;
  variant: 'warning' | 'success' | 'error' | 'info' | 'neutral';
} {
  const map: Record<ApplicationStatus, { label: string; variant: 'warning' | 'success' | 'error' | 'info' | 'neutral' }> = {
    APPLIED: { label: 'Applied', variant: 'info' },
    UNDER_REVIEW: { label: 'Under Review', variant: 'warning' },
    SHORTLISTED: { label: 'Shortlisted', variant: 'info' },
    INTERVIEW_SCHEDULED: { label: 'Interview', variant: 'success' },
    INTERVIEW_DONE: { label: 'Interview Done', variant: 'success' },
    OFFER_EXTENDED: { label: 'Offer', variant: 'success' },
    HIRED: { label: 'Hired', variant: 'success' },
    REJECTED: { label: 'Rejected', variant: 'error' },
  };
  return map[status] ?? { label: status, variant: 'neutral' };
}

export function jobTypeLabel(type: Job['type']): string {
  const labels: Record<Job['type'], string> = {
    FULL_TIME: 'Full Time',
    PART_TIME: 'Part Time',
    INTERNSHIP: 'Internship',
    CONTRACT: 'Contract',
  };
  return labels[type] ?? type;
}
