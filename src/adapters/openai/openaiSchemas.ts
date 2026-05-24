import { z } from 'zod';

const nullableString = z.preprocess((value) => value === null ? undefined : value, z.string().optional());
const nullableNumber = z.preprocess((value) => value === null ? undefined : value, z.number().optional());

const recommendationItemSchema = z.object({
  title: z.string().trim().min(1),
  reason: z.string().trim().min(1),
  estimatedCostMin: z.number(),
  estimatedCostMax: z.number(),
  weatherFit: nullableString,
  noveltyReason: nullableString,
  confidence: z.enum(['low', 'medium', 'high']),
  needsUserCheck: z.boolean(),
  notionSourceUrls: z.array(z.string())
});

export const recommendationResponseSchema = z.object({
  summary: z.string().trim().min(1),
  items: z.array(recommendationItemSchema).max(3)
});

export const structuredDateLogSchema = z.object({
  title: z.string().trim().min(1),
  date: z.string(),
  category: z.enum(['travel', 'date', 'restaurant', 'anniversary', 'seasonal', 'other']),
  location: nullableString,
  indoorOutdoor: z.preprocess(
    (value) => value === null ? undefined : value,
    z.enum(['indoor', 'outdoor', 'mixed', 'unknown']).optional()
  ),
  cost: nullableNumber,
  sentiment: nullableString,
  notes: nullableString,
  nextRecommendationHints: z.array(z.string()),
  missingFields: z.array(z.string())
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
