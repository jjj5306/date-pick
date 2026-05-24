import { z } from 'zod';

export const recommendationResponseSchema = z.object({
  summary: z.string(),
  items: z.array(z.object({
    title: z.string(),
    reason: z.string(),
    estimatedCostMin: z.number().optional(),
    estimatedCostMax: z.number().optional(),
    weatherFit: z.string().optional(),
    noveltyReason: z.string().optional(),
    confidence: z.enum(['low', 'medium', 'high']),
    needsUserCheck: z.boolean(),
    notionSourceUrls: z.array(z.string())
  })).max(3)
});

export const structuredDateLogSchema = z.object({
  title: z.string().min(1),
  date: z.string().min(1),
  category: z.enum(['travel', 'date', 'restaurant', 'anniversary', 'seasonal', 'other']),
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
    throw new RetryableOpenAIResponseError('OpenAI recommendation response failed validation.');
  }
  return result.data;
}

export function parseStructuredDateLog(value: unknown): StructuredDateLogJson {
  const result = structuredDateLogSchema.safeParse(value);
  if (!result.success) {
    throw new RetryableOpenAIResponseError('OpenAI date log response failed validation.');
  }
  return result.data;
}
