import type { Application, Company, Job, Skill, User } from '@prisma/client';
import { parseStringArray } from './jsonFields';

type JobWithRelations = Job & {
  company: Company;
  skills: { skill: Skill }[];
};

type ApplicationWithJob = Application & {
  job: JobWithRelations;
};

/**
 * Map Prisma user to a public DTO (no secrets).
 */
export function toUserDto(user: User): {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  skills: string[];
  createdAt: string;
  companyId: string | null;
} {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    skills: parseStringArray(user.skillsJson),
    createdAt: user.createdAt.toISOString(),
    companyId: user.companyId,
    ...(user.avatar ? { avatar: user.avatar } : {}),
  };
}

/**
 * Map Prisma company to API DTO.
 */
export function toCompanyDto(company: Company): {
  id: string;
  name: string;
  logo?: string;
  isVerified: boolean;
  verificationBadge?: string | null;
  industry: string;
  size: string;
  website?: string;
} {
  return {
    id: company.id,
    name: company.name,
    isVerified: company.isVerified,
    industry: company.industry,
    size: company.size,
    ...(company.logo ? { logo: company.logo } : {}),
    ...(company.verificationBadge ? { verificationBadge: company.verificationBadge } : {}),
    ...(company.website ? { website: company.website } : {}),
  };
}

/**
 * Map Prisma job (+ company + skills) to the shared `Job` contract shape.
 */
export function toJobDto(job: JobWithRelations, matchScore?: number): Record<string, unknown> {
  const skillsRequired = job.skills.map((js) => ({
    id: js.skill.id,
    name: js.skill.name,
    category: js.skill.category,
    aliases: parseStringArray(js.skill.aliasesJson),
    marketDemandScore: js.skill.marketDemandScore,
  }));

  return {
    id: job.id,
    title: job.title,
    company: toCompanyDto(job.company),
    description: job.description,
    requirements: parseStringArray(job.requirementsJson),
    responsibilities: parseStringArray(job.responsibilitiesJson),
    skillsRequired,
    location: job.location,
    type: job.type,
    isVerified: job.isVerified,
    ...(job.salaryMin != null ? { salaryMin: job.salaryMin } : {}),
    ...(job.salaryMax != null ? { salaryMax: job.salaryMax } : {}),
    postedAt: job.postedAt.toISOString(),
    ...(job.expiresAt ? { expiresAt: job.expiresAt.toISOString() } : {}),
    ...(typeof matchScore === 'number' ? { matchScore } : {}),
  };
}

/**
 * Serialize application for API responses (dates as ISO strings).
 */
export function toApplicationDto(app: ApplicationWithJob): Record<string, unknown> {
  let gapReport: unknown = undefined;
  if (app.gapReportJson) {
    try {
      gapReport = JSON.parse(app.gapReportJson) as unknown;
    } catch {
      gapReport = undefined;
    }
  }

  return {
    id: app.id,
    candidateId: app.candidateId,
    jobId: app.jobId,
    status: app.status,
    matchScore: app.matchScore,
    ...(gapReport ? { gapReport } : {}),
    ...(app.rejectionReason ? { rejectionReason: app.rejectionReason } : {}),
    appliedAt: app.appliedAt.toISOString(),
    updatedAt: app.updatedAt.toISOString(),
    ...(app.coverNote ? { coverNote: app.coverNote } : {}),
    job: toJobDto(app.job),
  };
}
