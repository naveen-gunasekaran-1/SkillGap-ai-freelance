import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';
import { z } from 'zod';
import type { EducationEntry, ExperienceEntry, SkillAssessment } from '@skillgap/types';
import { env } from './env';
import { HttpError } from './httpError';

const MAX_TEXT_CHARS = 18000;

const skillNames = [
  'JavaScript',
  'TypeScript',
  'React',
  'Next.js',
  'Node.js',
  'Express',
  'Python',
  'Django',
  'Flask',
  'Java',
  'Spring Boot',
  'Kotlin',
  'Swift',
  'React Native',
  'Flutter',
  'HTML',
  'CSS',
  'Tailwind CSS',
  'SQL',
  'PostgreSQL',
  'MySQL',
  'MongoDB',
  'Redis',
  'AWS',
  'Azure',
  'Google Cloud',
  'Docker',
  'Kubernetes',
  'Git',
  'CI/CD',
  'REST API',
  'GraphQL',
  'Machine Learning',
  'Data Analysis',
  'Pandas',
  'NumPy',
  'TensorFlow',
  'PyTorch',
  'Figma',
  'UI/UX',
  'Agile',
  'Scrum',
];

const parsedResumeSchema = z.object({
  title: z.string().max(120).optional().default(''),
  summary: z.string().max(600).optional().default(''),
  skills: z.array(z.string().min(1).max(64)).max(40).optional().default([]),
  education: z
    .array(
      z.object({
        school: z.string().min(1).max(160),
        degree: z.string().min(1).max(120),
        field: z.string().max(120).optional(),
        startYear: z.coerce.number().int().min(1980).max(2100).optional(),
        endYear: z.coerce.number().int().min(1980).max(2100).optional(),
        gpa: z.string().max(12).optional(),
      }),
    )
    .max(10)
    .optional()
    .default([]),
  experience: z
    .array(
      z.object({
        company: z.string().min(1).max(160),
        role: z.string().min(1).max(120),
        startDate: z.string().min(4).max(24).optional(),
        endDate: z.string().min(4).max(24).optional(),
        summary: z.string().max(800).optional(),
        bullets: z.array(z.string().min(1).max(220)).max(8).optional(),
      }),
    )
    .max(20)
    .optional()
    .default([]),
});

export interface ParsedResumeProfile {
  title?: string;
  summary?: string;
  skills: string[];
  skillLevels: SkillAssessment[];
  education: EducationEntry[];
  experience: ExperienceEntry[];
}

interface ResumeFile {
  buffer: Buffer;
  originalName: string;
  contentType: string;
}

export async function parseResume(file: ResumeFile): Promise<ParsedResumeProfile> {
  const text = await extractResumeText(file);
  const aiParsed = await parseWithOpenAI(text);
  return aiParsed ?? parseHeuristically(text);
}

async function extractResumeText(file: ResumeFile): Promise<string> {
  const name = file.originalName.toLowerCase();
  const type = file.contentType;

  if (type === 'application/pdf' || name.endsWith('.pdf')) {
    const parser = new PDFParse({ data: file.buffer });
    try {
      const data = await parser.getText();
      return normalizeText(data.text);
    } finally {
      await parser.destroy();
    }
  }

  if (
    type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    name.endsWith('.docx')
  ) {
    const data = await mammoth.extractRawText({ buffer: file.buffer });
    return normalizeText(data.value);
  }

  if (type === 'text/plain' || name.endsWith('.txt')) {
    return normalizeText(file.buffer.toString('utf8'));
  }

  throw new HttpError(400, 'Resume parsing supports PDF, DOCX, or TXT files');
}

async function parseWithOpenAI(text: string): Promise<ParsedResumeProfile | null> {
  if (!env.OPENAI_API_KEY || text.length < 80) return null;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: env.OPENAI_MODEL,
        temperature: 0.1,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'Extract resume data as compact JSON only. Keys: title, summary, skills, education, experience. Use empty arrays for unknown values. education items: school, degree, field, startYear, endYear, gpa. experience items: company, role, startDate, endDate, summary, bullets.',
          },
          {
            role: 'user',
            content: text.slice(0, MAX_TEXT_CHARS),
          },
        ],
      }),
      signal: controller.signal,
    });

    if (!res.ok) return null;

    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;

    const parsed = parsedResumeSchema.parse(JSON.parse(content));
    return normalizeParsedResume(parsed);
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

function parseHeuristically(text: string): ParsedResumeProfile {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && line.length < 220);
  const lower = text.toLowerCase();

  const skills = unique(skillNames.filter((skill) => lower.includes(skill.toLowerCase()))).slice(
    0,
    30,
  );

  const education = extractEducation(lines);
  const experience = extractExperience(lines);
  const summary = lines.find((line) => line.length >= 80 && !line.includes('@'))?.slice(0, 600);

  return {
    ...(summary ? { summary } : {}),
    skills,
    skillLevels: toSkillLevels(skills),
    education,
    experience,
  };
}

function normalizeParsedResume(raw: z.infer<typeof parsedResumeSchema>): ParsedResumeProfile {
  const skills = unique(raw.skills.map(cleanText).filter(Boolean)).slice(0, 40);
  const thisYear = new Date().getFullYear();

  return {
    ...(raw.title ? { title: cleanText(raw.title) } : {}),
    ...(raw.summary ? { summary: cleanText(raw.summary).slice(0, 600) } : {}),
    skills,
    skillLevels: toSkillLevels(skills),
    education: raw.education
      .map((entry) => ({
        school: cleanText(entry.school),
        degree: cleanText(entry.degree),
        ...(entry.field ? { field: cleanText(entry.field) } : {}),
        startYear: entry.startYear ?? entry.endYear ?? thisYear,
        ...(entry.endYear ? { endYear: entry.endYear } : {}),
        ...(entry.gpa ? { gpa: cleanText(entry.gpa) } : {}),
      }))
      .filter((entry) => entry.school && entry.degree)
      .slice(0, 10),
    experience: raw.experience
      .map((entry) => ({
        company: cleanText(entry.company),
        role: cleanText(entry.role),
        startDate: cleanText(entry.startDate ?? 'Unknown'),
        ...(entry.endDate ? { endDate: cleanText(entry.endDate) } : {}),
        ...(entry.summary ? { summary: cleanText(entry.summary).slice(0, 800) } : {}),
        ...(entry.bullets?.length
          ? { bullets: entry.bullets.map(cleanText).filter(Boolean).slice(0, 8) }
          : {}),
      }))
      .filter((entry) => entry.company && entry.role)
      .slice(0, 20),
  };
}

function extractEducation(lines: string[]): EducationEntry[] {
  const yearPattern = /(19|20)\d{2}/g;
  const degreePattern = /(b\.?tech|m\.?tech|bachelor|master|mba|bsc|msc|be|me|phd|diploma)/i;

  return lines
    .filter((line) => degreePattern.test(line))
    .map((line) => {
      const years = [...line.matchAll(yearPattern)].map((match) => Number(match[0]));
      return {
        school: cleanText(line.replace(degreePattern, '').replace(yearPattern, '')).slice(0, 160),
        degree: cleanText(line.match(degreePattern)?.[0] ?? 'Degree'),
        startYear: years[0] ?? years[1] ?? new Date().getFullYear(),
        ...(years[1] ? { endYear: years[1] } : {}),
      };
    })
    .filter((entry) => entry.school.length > 1)
    .slice(0, 5);
}

function extractExperience(lines: string[]): ExperienceEntry[] {
  const dateRange =
    /((jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+)?(19|20)\d{2}\s*(-|to|–)\s*(((jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+)?(19|20)\d{2}|present|current)/i;

  return lines
    .filter((line) => dateRange.test(line))
    .map((line) => {
      const match = line.match(dateRange);
      const dates = match?.[0] ?? 'Unknown';
      const [startDate, endDate] = dates.split(/\s*(?:-|to|–)\s*/i);
      const title = cleanText(line.replace(dateRange, ''));
      const [role, company] = title.split(/\s+at\s+|\s+-\s+|\s+\|\s+/i);
      return {
        company: cleanText(company ?? role ?? 'Company').slice(0, 160),
        role: cleanText(role ?? 'Role').slice(0, 120),
        startDate: cleanText(startDate || 'Unknown'),
        ...(endDate ? { endDate: cleanText(endDate) } : {}),
      };
    })
    .filter((entry) => entry.company && entry.role)
    .slice(0, 8);
}

function toSkillLevels(skills: string[]): SkillAssessment[] {
  return skills.map((name) => ({ name, level: 'INTERMEDIATE' }));
}

function normalizeText(value: string): string {
  const normalized = value
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
  if (normalized.length < 40) {
    throw new HttpError(400, 'Could not read enough text from this resume');
  }
  return normalized.slice(0, MAX_TEXT_CHARS);
}

function cleanText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function unique(values: string[]): string[] {
  const seen = new Set<string>();
  return values.filter((value) => {
    const key = value.toLowerCase();
    if (!value || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
