export interface User {
  id: string;
  email: string;
  name: string;
  role: 'CANDIDATE' | 'COMPANY' | 'ADMIN';
  avatar?: string;
  createdAt: Date;
}

export interface Company {
  id: string;
  name: string;
  logo?: string;
  isVerified: boolean;
  verificationBadge?: 'GSTIN' | 'MCA' | 'MANUAL';
  industry: string;
  size: string;
  website?: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  aliases: string[];
  marketDemandScore: number;
}

export type ApplicationStatus =
  | 'APPLIED'
  | 'UNDER_REVIEW'
  | 'SHORTLISTED'
  | 'INTERVIEW_SCHEDULED'
  | 'INTERVIEW_DONE'
  | 'OFFER_EXTENDED'
  | 'HIRED'
  | 'REJECTED';

export interface SkillGap {
  skillName: string;
  required: string;
  candidate: string;
  severity: 'CRITICAL' | 'MODERATE' | 'MINOR';
  explanation: string;
}

export interface LearningRecommendation {
  skillName: string;
  resourceTitle: string;
  platform: string;
  url: string;
  estimatedHours: number;
  isFree: boolean;
  priority: number;
}

export interface GapReport {
  id: string;
  applicationId: string;
  overallMatchPercent: number;
  criticalGaps: SkillGap[];
  partialMatches: SkillGap[];
  strengths: string[];
  recommendations: LearningRecommendation[];
  generatedAt: Date;
}

export interface Job {
  id: string;
  title: string;
  company: Company;
  description: string;
  requirements: string[];
  skillsRequired: Skill[];
  location: string;
  type: 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'CONTRACT';
  isVerified: boolean;
  salaryMin?: number;
  salaryMax?: number;
  postedAt: Date;
  expiresAt?: Date;
}

export interface Application {
  id: string;
  candidateId: string;
  jobId: string;
  status: ApplicationStatus;
  matchScore: number;
  gapReport?: GapReport;
  rejectionReason?: string;
  appliedAt: Date;
  updatedAt: Date;
}
