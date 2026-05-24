import type { RecommendationContext } from '../../engines/recommendation/contextBuilder.js';

export function buildRecommendationPrompt(context: RecommendationContext): string {
  const candidates = context.candidates.map((candidate, index) => ({
    rank: index + 1,
    title: candidate.title,
    category: candidate.category,
    location: candidate.location,
    estimatedCost: candidate.estimatedCost,
    reasons: candidate.reasons,
    needsUserCheck: candidate.needsUserCheck
  }));

  return JSON.stringify({
    task: 'Create up to three concise Korean date recommendations for Slack.',
    userRequest: context.userRequest,
    weather: context.weather,
    anniversaries: context.anniversaries,
    candidates
  });
}

export function buildDateLogExtractionPrompt(text: string): string {
  return JSON.stringify({
    task: 'Extract a structured Korean date log. Return JSON only.',
    userText: text,
    schema: {
      title: 'string, short Korean title. Use a sensible fallback if unclear.',
      date: 'string in YYYY-MM-DD format. Use an empty string when unknown.',
      category: 'one of travel, date, restaurant, anniversary, seasonal, other',
      location: 'optional string',
      indoorOutdoor: 'optional one of indoor, outdoor, mixed, unknown',
      cost: 'optional number in KRW',
      sentiment: 'optional string',
      notes: 'optional string',
      nextRecommendationHints: 'string[]',
      missingFields: 'string[] for unknown required fields such as date or location'
    }
  });
}
