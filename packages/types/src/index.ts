export type SkillLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

export interface SkillAssessment {
  name: string;
  level: SkillLevel;
}

export interface EducationEntry {
  school: string;
  degree: string;
  field?: string;
  startYear: number;
  endYear?: number;
  gpa?: string;
}

export interface ExperienceEntry {
  company: string;
  role: string;
  startDate: string;
  endDate?: string;
  summary?: string;
  bullets?: string[];
}

export interface InternshipEntry {
  company: string;
  role: string;
  startDate: string;
  endDate?: string;
  summary?: string;
}

export interface ProjectEntry {
  name: string;
  stack: string[];
  link?: string;
  summary?: string;
}

export interface ProfileLink {
  label: string;
  url: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'CANDIDATE' | 'COMPANY' | 'ADMIN';
  title: string;
  location: string;
  summary: string;
  phone?: string | null;
  avatar?: string;
  skills?: string[];
  skillLevels?: SkillAssessment[];
  education?: EducationEntry[];
  experience?: ExperienceEntry[];
  internships?: InternshipEntry[];
  projects?: ProjectEntry[];
  links?: ProfileLink[];
  resumeUrl?: string | null;
  resumeStatus?: string;
  resumeVerifiedAt?: Date | null;
  emailVerified?: boolean;
  skillsVerified?: boolean;
  companyId?: string | null;
  createdAt: Date;
}

export interface Company {
  id: string;
  name: string;
  logo?: string;
  isVerified: boolean;
  verificationStatus?:
    | 'NOT_STARTED'
    | 'IN_PROGRESS'
    | 'SUBMITTED'
    | 'UNDER_REVIEW'
    | 'VERIFIED'
    | 'REJECTED'
    | 'SUSPENDED';
  verificationBadge?: 'GSTIN' | 'MCA' | 'MANUAL';
  industry: string;
  size: string;
  website?: string;
  description?: string;
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

export type RejectionCategory =
  | 'Technical Skills'
  | 'Communication'
  | 'Experience Gap'
  | 'Domain Knowledge'
  | 'Leadership'
  | 'Culture Fit'
  | 'System Design'
  | 'DevOps'
  | 'Security'
  | 'Architecture';

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

export interface AiExplanation {
  id: string;
  applicationId: string;
  type: 'GAP_REPORT' | 'REJECTION_REASON' | 'LEARNING_ROADMAP' | 'WEAK_EVIDENCE';
  model: string;
  promptVersion: string;
  confidence: number;
  summary: string;
  missingSkills: SkillGap[];
  weakEvidence: SkillGap[];
  strengths: string[];
  recommendations: LearningRecommendation[];
  generatedBy: string;
  createdAt: Date;
}

export interface Job {
  id: string;
  title: string;
  company: Company;
  description: string;
  requirements: string[];
  responsibilities?: string[];
  skillsRequired: Skill[];
  location: string;
  type: 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'CONTRACT';
  isVerified: boolean;
  salaryMin?: number;
  salaryMax?: number;
  postedAt: Date;
  expiresAt?: Date;
  /** Present when the API computes a personalized match for the signed-in candidate. */
  matchScore?: number;
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
  job?: Job;
  candidate?: User;
  aiExplanations?: AiExplanation[];
}
