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
    requiredFields: ['title', 'date', 'category', 'location', 'cost', 'notes']
  });
}
