export const ROLE = {
  CANDIDATE: 'CANDIDATE',
  COMPANY: 'COMPANY',
  ADMIN: 'ADMIN',
} as const;

export type Role = (typeof ROLE)[keyof typeof ROLE];

export const APPLICATION_STATUS = {
  APPLIED: 'APPLIED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  SHORTLISTED: 'SHORTLISTED',
  INTERVIEW_SCHEDULED: 'INTERVIEW_SCHEDULED',
  INTERVIEW_DONE: 'INTERVIEW_DONE',
  OFFER_EXTENDED: 'OFFER_EXTENDED',
  HIRED: 'HIRED',
  REJECTED: 'REJECTED',
} as const;

export type ApplicationStatus = (typeof APPLICATION_STATUS)[keyof typeof APPLICATION_STATUS];

export const JOB_TYPE = {
  FULL_TIME: 'FULL_TIME',
  PART_TIME: 'PART_TIME',
  INTERNSHIP: 'INTERNSHIP',
  CONTRACT: 'CONTRACT',
} as const;

export type JobType = (typeof JOB_TYPE)[keyof typeof JOB_TYPE];
