import { env } from './env';
import type { GapReport } from '@skillgap/types';

interface OpenAiMessage {
  role: 'system' | 'user';
  content: string;
}

/**
 * Optionally enrich a baseline gap report using OpenAI (safe merge; failures are swallowed).
 */
export async function enrichGapReportWithOpenAI(
  base: GapReport,
  context: { jobTitle: string },
): Promise<GapReport> {
  const key = env.OPENAI_API_KEY;
  if (!key) return base;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6500);

  try {
    const messages: OpenAiMessage[] = [
      {
        role: 'system',
        content:
          'You are a career coach. Return compact JSON only with keys: summary (string), extraRecommendations (array of {skillName,resourceTitle,platform,url,estimatedHours,isFree,priority}). Max 3 extra recommendations.',
      },
      {
        role: 'user',
        content: JSON.stringify({
          jobTitle: context.jobTitle,
          overallMatchPercent: base.overallMatchPercent,
          criticalGaps: base.criticalGaps.map((g) => g.skillName),
        }),
      },
    ];

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: env.OPENAI_MODEL,
        temperature: 0.2,
        messages,
        response_format: { type: 'json_object' },
      }),
      signal: controller.signal,
    });

    if (!res.ok) return base;

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const raw = data.choices?.[0]?.message?.content;
    if (!raw) return base;

    const parsed = JSON.parse(raw) as {
      summary?: string;
      extraRecommendations?: Array<{
        skillName: string;
        resourceTitle: string;
        platform: string;
        url: string;
        estimatedHours: number;
        isFree: boolean;
        priority: number;
      }>;
    };

    const extras = (parsed.extraRecommendations ?? []).slice(0, 3).map((r, i) => ({
      skillName: r.skillName,
      resourceTitle: r.resourceTitle,
      platform: r.platform,
      url: r.url || 'https://example.com/learn',
      estimatedHours: Number(r.estimatedHours) || 6,
      isFree: Boolean(r.isFree),
      priority: base.recommendations.length + i + 1,
    }));

    return {
      ...base,
      strengths:
        typeof parsed.summary === 'string' && parsed.summary.length > 0
          ? [parsed.summary, ...base.strengths].slice(0, 10)
          : base.strengths,
      recommendations: [...base.recommendations, ...extras].slice(0, 12),
    };
  } catch {
    return base;
  } finally {
    clearTimeout(timeoutId);
  }
}
