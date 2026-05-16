import type { AiExplanation, GapReport, SkillGap } from '@skillgap/types';
import { Prisma } from '@prisma/client';
import type { AiExplanation as PrismaAiExplanation } from '@prisma/client';
import { prisma } from './prisma';
import { env } from './env';

const GAP_REPORT_PROMPT_VERSION = 'gap-report-v1';
const REJECTION_PROMPT_VERSION = 'rejection-reason-v1';

function summarize(report: GapReport): string {
  const firstGap = report.criticalGaps[0] ?? report.partialMatches[0];
  if (!firstGap) {
    return `The candidate has a ${report.overallMatchPercent}% match with no critical skill gaps detected.`;
  }
  return `The candidate has a ${report.overallMatchPercent}% match. The strongest evidence gap is ${firstGap.skillName}: ${firstGap.explanation}`;
}

export async function persistGapReportExplanation(report: GapReport): Promise<AiExplanation> {
  const existing = await prisma.aiExplanation.findFirst({
    where: { applicationId: report.applicationId, type: 'GAP_REPORT' },
    orderBy: { createdAt: 'desc' },
  });

  const data = {
    applicationId: report.applicationId,
    type: 'GAP_REPORT',
    model: env.OPENAI_API_KEY ? env.OPENAI_MODEL : 'deterministic-skillgap-v1',
    promptVersion: GAP_REPORT_PROMPT_VERSION,
    confidence: Math.max(30, Math.min(98, report.overallMatchPercent)),
    summary: summarize(report),
    missingSkillsJson: report.criticalGaps as unknown as Prisma.InputJsonValue,
    weakEvidenceJson: report.partialMatches as unknown as Prisma.InputJsonValue,
    strengthsJson: report.strengths as unknown as Prisma.InputJsonValue,
    recommendationsJson: report.recommendations as unknown as Prisma.InputJsonValue,
    rawOutputJson: report as unknown as Prisma.InputJsonValue,
    generatedBy: env.OPENAI_API_KEY ? 'openai' : 'system',
  } satisfies Prisma.AiExplanationUncheckedCreateInput;

  const explanation = existing
    ? await prisma.aiExplanation.update({ where: { id: existing.id }, data })
    : await prisma.aiExplanation.create({ data });

  return toAiExplanationDto(explanation);
}

export async function persistRejectionExplanation(input: {
  applicationId: string;
  rejectionReason: string;
  matchScore: number;
  actorId: string;
  categories?: string[];
  missingSkills?: string[];
  evidenceNotes?: string;
}): Promise<AiExplanation> {
  const categoryText = input.categories?.length ? ` Categories: ${input.categories.join(', ')}.` : '';
  const skillText = input.missingSkills?.length ? ` Missing evidence: ${input.missingSkills.join(', ')}.` : '';
  const summary = `The company rejected this application with structured reasoning.${categoryText}${skillText} Explanation: ${input.rejectionReason}`;
  const existing = await prisma.aiExplanation.findFirst({
    where: { applicationId: input.applicationId, type: 'REJECTION_REASON' },
    orderBy: { createdAt: 'desc' },
  });

  const data = {
    applicationId: input.applicationId,
    type: 'REJECTION_REASON',
    model: 'structured-rejection-v1',
    promptVersion: REJECTION_PROMPT_VERSION,
    confidence: Math.max(30, Math.min(95, 100 - input.matchScore)),
    summary,
    missingSkillsJson: [] as unknown as Prisma.InputJsonValue,
    weakEvidenceJson: (input.missingSkills ?? []).map((skillName) => ({
      skillName,
      required: skillName,
      candidate: input.evidenceNotes || 'Insufficient evidence provided',
      severity: 'MODERATE',
      explanation: input.rejectionReason,
    })) as unknown as Prisma.InputJsonValue,
    strengthsJson: [] as unknown as Prisma.InputJsonValue,
    recommendationsJson: [] as unknown as Prisma.InputJsonValue,
    rawOutputJson: {
      rejectionReason: input.rejectionReason,
      categories: input.categories ?? [],
      missingSkills: input.missingSkills ?? [],
      evidenceNotes: input.evidenceNotes ?? null,
      matchScore: input.matchScore,
      actorId: input.actorId,
    } as Prisma.InputJsonValue,
    generatedBy: 'recruiter',
  } satisfies Prisma.AiExplanationUncheckedCreateInput;

  const explanation = existing
    ? await prisma.aiExplanation.update({ where: { id: existing.id }, data })
    : await prisma.aiExplanation.create({ data });

  return toAiExplanationDto(explanation);
}

export function toAiExplanationDto(row: PrismaAiExplanation): AiExplanation {
  return {
    id: row.id,
    applicationId: row.applicationId,
    type: row.type as AiExplanation['type'],
    model: row.model,
    promptVersion: row.promptVersion,
    confidence: row.confidence,
    summary: row.summary,
    missingSkills: row.missingSkillsJson as unknown as SkillGap[],
    weakEvidence: row.weakEvidenceJson as unknown as SkillGap[],
    strengths: row.strengthsJson as unknown as string[],
    recommendations: row.recommendationsJson as unknown as AiExplanation['recommendations'],
    generatedBy: row.generatedBy,
    createdAt: row.createdAt,
  };
}
