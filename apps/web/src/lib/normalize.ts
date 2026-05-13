import type { Application, Company, GapReport, Job, Skill, User } from '@skillgap/types';

function parseCompany(raw: unknown): Company {
  const c = raw as Record<string, unknown>;
  const out: Company = {
    id: String(c.id),
    name: String(c.name),
    isVerified: Boolean(c.isVerified),
    industry: String(c.industry),
    size: String(c.size),
  };
  if (typeof c.logo === 'string' && c.logo.length > 0) {
    out.logo = c.logo;
  }
  if (typeof c.website === 'string' && c.website.length > 0) {
    out.website = c.website;
  }
  if (c.verificationBadge === 'GSTIN' || c.verificationBadge === 'MCA' || c.verificationBadge === 'MANUAL') {
    out.verificationBadge = c.verificationBadge;
  }
  return out;
}

export function parseSkill(raw: unknown): Skill {
  const s = raw as Record<string, unknown>;
  return {
    id: String(s.id),
    name: String(s.name),
    category: String(s.category ?? 'General'),
    aliases: Array.isArray(s.aliases) ? s.aliases.filter((x): x is string => typeof x === 'string') : [],
    marketDemandScore: Number(s.marketDemandScore ?? 0),
  };
}

export function parseJob(raw: unknown): Job {
  const j = raw as Record<string, unknown>;
  const skillsRequired = Array.isArray(j.skillsRequired) ? j.skillsRequired.map(parseSkill) : [];
  const requirements = Array.isArray(j.requirements)
    ? j.requirements.filter((x): x is string => typeof x === 'string')
    : [];
  const responsibilities = Array.isArray(j.responsibilities)
    ? j.responsibilities.filter((x): x is string => typeof x === 'string')
    : undefined;

  return {
    id: String(j.id),
    title: String(j.title),
    company: parseCompany(j.company),
    description: String(j.description ?? ''),
    requirements,
    ...(responsibilities && responsibilities.length > 0 ? { responsibilities } : {}),
    skillsRequired,
    location: String(j.location ?? ''),
    type: j.type as Job['type'],
    isVerified: Boolean(j.isVerified),
    ...(typeof j.salaryMin === 'number' ? { salaryMin: j.salaryMin } : {}),
    ...(typeof j.salaryMax === 'number' ? { salaryMax: j.salaryMax } : {}),
    postedAt: new Date(String(j.postedAt)),
    ...(j.expiresAt ? { expiresAt: new Date(String(j.expiresAt)) } : {}),
    ...(typeof j.matchScore === 'number' ? { matchScore: j.matchScore } : {}),
  };
}

export function parseGapReport(raw: unknown): GapReport {
  const g = raw as Record<string, unknown>;
  return {
    id: String(g.id),
    applicationId: String(g.applicationId),
    overallMatchPercent: Number(g.overallMatchPercent ?? 0),
    criticalGaps: Array.isArray(g.criticalGaps) ? (g.criticalGaps as GapReport['criticalGaps']) : [],
    partialMatches: Array.isArray(g.partialMatches) ? (g.partialMatches as GapReport['partialMatches']) : [],
    strengths: Array.isArray(g.strengths) ? g.strengths.filter((x): x is string => typeof x === 'string') : [],
    recommendations: Array.isArray(g.recommendations)
      ? (g.recommendations as GapReport['recommendations'])
      : [],
    generatedAt: new Date(String(g.generatedAt)),
  };
}

export function parseApplication(raw: unknown): Application {
  const a = raw as Record<string, unknown>;
  const gapReport = a.gapReport ? parseGapReport(a.gapReport) : undefined;
  return {
    id: String(a.id),
    candidateId: String(a.candidateId),
    jobId: String(a.jobId),
    status: a.status as Application['status'],
    matchScore: Number(a.matchScore ?? 0),
    ...(gapReport ? { gapReport } : {}),
    ...(a.rejectionReason ? { rejectionReason: String(a.rejectionReason) } : {}),
    appliedAt: new Date(String(a.appliedAt)),
    updatedAt: new Date(String(a.updatedAt)),
    ...(a.job ? { job: parseJob(a.job) } : {}),
  };
}

export function parseUser(raw: unknown): User {
  const u = raw as Record<string, unknown>;
  const companyId =
    u.companyId === null
      ? { companyId: null as null }
      : u.companyId !== undefined
        ? { companyId: String(u.companyId) }
        : {};

  return {
    id: String(u.id),
    email: String(u.email),
    name: String(u.name),
    role: u.role as User['role'],
    title: String(u.title ?? 'Candidate'),
    location: String(u.location ?? ''),
    summary: String(u.summary ?? ''),
    phone: u.phone == null ? null : String(u.phone),
    ...(u.avatar ? { avatar: String(u.avatar) } : {}),
    ...(Array.isArray(u.skills) ? { skills: u.skills.filter((x): x is string => typeof x === 'string') } : {}),
    ...(Array.isArray(u.skillLevels) ? { skillLevels: u.skillLevels as User['skillLevels'] } : {}),
    ...(Array.isArray(u.education) ? { education: u.education as User['education'] } : {}),
    ...(Array.isArray(u.experience) ? { experience: u.experience as User['experience'] } : {}),
    ...(Array.isArray(u.internships) ? { internships: u.internships as User['internships'] } : {}),
    ...(Array.isArray(u.projects) ? { projects: u.projects as User['projects'] } : {}),
    ...(Array.isArray(u.links) ? { links: u.links as User['links'] } : {}),
    ...(u.resumeUrl ? { resumeUrl: String(u.resumeUrl) } : {}),
    ...(u.resumeStatus ? { resumeStatus: String(u.resumeStatus) } : {}),
    ...(u.resumeVerifiedAt ? { resumeVerifiedAt: new Date(String(u.resumeVerifiedAt)) } : {}),
    ...(typeof u.emailVerified === 'boolean' ? { emailVerified: u.emailVerified } : {}),
    ...(typeof u.skillsVerified === 'boolean' ? { skillsVerified: u.skillsVerified } : {}),
    ...companyId,
    createdAt: new Date(String(u.createdAt)),
  };
}
