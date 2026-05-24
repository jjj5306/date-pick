import { z } from 'zod';

const categoryNameMap: Record<string, string> = {
  '여행': 'travel',
  '데이트': 'date',
  '맛집': 'restaurant',
  '기념일': 'anniversary',
  '계절': 'seasonal',
  '기타': 'other'
};

const recommendationItemSchema = z.preprocess((value) => {
  if (!value || typeof value !== 'object') {
    return value;
  }

  const item = value as Record<string, unknown>;
  return {
    ...item,
    reason: item.reason ?? item.description ?? item.rationale,
    notionSourceUrls: item.notionSourceUrls ?? item.sourceUrls ?? item.sources
  };
}, z.object({
  title: z.string().trim().min(1),
  reason: z.string().trim().min(1),
  estimatedCostMin: z.coerce.number().optional(),
  estimatedCostMax: z.coerce.number().optional(),
  weatherFit: z.string().optional(),
  noveltyReason: z.string().optional(),
  confidence: z.enum(['low', 'medium', 'high']).catch('medium'),
  needsUserCheck: z.boolean().catch(true),
  notionSourceUrls: z.array(z.string()).catch([])
}));

export const recommendationResponseSchema = z.preprocess((value) => {
  if (!value || typeof value !== 'object') {
    return value;
  }

  const response = value as Record<string, unknown>;
  return {
    ...response,
    summary: response.summary ?? response.message ?? response.title,
    items: response.items ?? response.recommendations ?? response.results
  };
}, z.object({
  summary: z.string().trim().min(1),
  items: z.array(recommendationItemSchema).max(3)
}));

export const structuredDateLogSchema = z.object({
  title: z.string().trim().min(1).catch('데이트 기록'),
  date: z.string().catch(''),
  category: z.preprocess(
    (value) => typeof value === 'string' ? categoryNameMap[value] ?? value : value,
    z.enum(['travel', 'date', 'restaurant', 'anniversary', 'seasonal', 'other']).catch('date')
  ),
  location: z.string().optional(),
  indoorOutdoor: z.enum(['indoor', 'outdoor', 'mixed', 'unknown']).optional(),
  cost: z.number().optional(),
  sentiment: z.string().optional(),
  notes: z.string().optional(),
  nextRecommendationHints: z.array(z.string()).default([]),
  missingFields: z.array(z.string()).default([])
});

export type RecommendationResponseJson = z.infer<typeof recommendationResponseSchema>;
export type StructuredDateLogJson = z.infer<typeof structuredDateLogSchema>;

export class RetryableOpenAIResponseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RetryableOpenAIResponseError';
  }
}

export function parseRecommendationResponse(value: unknown): RecommendationResponseJson {
  const result = recommendationResponseSchema.safeParse(value);
  if (!result.success) {
    throw new RetryableOpenAIResponseError(`OpenAI recommendation response failed validation: ${formatZodIssues(result.error.issues)}`);
  }
  return result.data;
}

export function parseStructuredDateLog(value: unknown): StructuredDateLogJson {
  const result = structuredDateLogSchema.safeParse(value);
  if (!result.success) {
    throw new RetryableOpenAIResponseError(`OpenAI date log response failed validation: ${formatZodIssues(result.error.issues)}`);
  }
  return result.data;
}

function formatZodIssues(issues: z.ZodIssue[]): string {
  return issues
    .slice(0, 3)
    .map((issue) => `${issue.path.join('.') || '<root>'} ${issue.message}`)
    .join('; ');
}
