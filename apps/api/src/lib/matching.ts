import type { SkillGap, LearningRecommendation, GapReport } from '@skillgap/types';

/**
 * Normalize skill labels for overlap checks.
 */
function norm(s: string): string {
  return s.trim().toLowerCase();
}

/**
 * Compute a 0–100 match score from candidate skills vs required job skills.
 */
export function computeMatchScore(candidateSkills: string[], jobSkillNames: string[]): number {
  const c = new Set(candidateSkills.map(norm).filter(Boolean));
  const required = jobSkillNames.map(norm).filter(Boolean);
  if (required.length === 0) return 72;

  let score = 0;
  for (const req of required) {
    if (c.has(req)) {
      score += 1;
      continue;
    }
    const partial = [...c].some((x) => x.includes(req) || req.includes(x));
    if (partial) score += 0.55;
  }

  return Math.min(100, Math.round((score / required.length) * 100));
}

/**
 * Build a structured gap report used when OpenAI is unavailable or as a baseline.
 */
export function buildGapReport(input: {
  applicationId: string;
  candidateSkills: string[];
  jobTitle: string;
  jobSkillNames: string[];
  requirements: string[];
}): GapReport {
  const c = new Set(input.candidateSkills.map(norm).filter(Boolean));
  const required = input.jobSkillNames.map((n) => n.trim()).filter(Boolean);

  const criticalGaps: SkillGap[] = [];
  const partialMatches: SkillGap[] = [];
  const strengths: string[] = [];

  for (const skill of required) {
    const sn = norm(skill);
    if (c.has(sn)) {
      strengths.push(`Strong alignment on ${skill}`);
      continue;
    }
    const fuzzy = [...c].find((x) => x.includes(sn) || sn.includes(x));
    if (fuzzy) {
      partialMatches.push({
        skillName: skill,
        required: 'Proficiency expected for this role',
        candidate: `Related exposure (${fuzzy})`,
        severity: 'MODERATE',
        explanation: `Your profile shows adjacent experience, but recruiters typically expect clearer ${skill} depth for ${input.jobTitle}.`,
      });
    } else {
      criticalGaps.push({
        skillName: skill,
        required: 'Required for this role',
        candidate: 'Not evidenced on your profile',
        severity: 'CRITICAL',
        explanation: `This role lists ${skill} as a core requirement. Adding a focused project or certification will materially improve ATS match scores.`,
      });
    }
  }

  const overall = computeMatchScore(input.candidateSkills, input.jobSkillNames);

  const recommendations: LearningRecommendation[] = [];
  let priority = 1;
  for (const g of [...criticalGaps, ...partialMatches].slice(0, 5)) {
    recommendations.push({
      skillName: g.skillName,
      resourceTitle: `${g.skillName} — targeted practice track`,
      platform: 'SkillGap curated',
      url: 'https://example.com/learn',
      estimatedHours: g.severity === 'CRITICAL' ? 12 : 6,
      isFree: true,
      priority: priority++,
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      skillName: 'Career readiness',
      resourceTitle: 'Interview storytelling for technical roles',
      platform: 'SkillGap curated',
      url: 'https://example.com/learn',
      estimatedHours: 4,
      isFree: true,
      priority: 1,
    });
  }

  const reportId = `${input.applicationId}-gap`;

  return {
    id: reportId,
    applicationId: input.applicationId,
    overallMatchPercent: overall,
    criticalGaps,
    partialMatches,
    strengths: strengths.slice(0, 8),
    recommendations,
    generatedAt: new Date(),
  };
}
