import type { RecommendationContext } from '../../engines/recommendation/contextBuilder.js';

export function buildRecommendationPrompt(context: RecommendationContext): string {
  return JSON.stringify({
    task: 'recommend_dates',
    language: 'ko',
    request: context.userRequest,
    weather: context.weather,
    anniversaries: context.anniversaries,
    candidates: context.candidates.map((candidate, index) => ({
      rank: index + 1,
      title: candidate.title,
      category: candidate.category,
      location: candidate.location,
      estimatedCost: candidate.estimatedCost,
      sourceUrl: candidate.sourceUrl,
      reasons: candidate.reasons,
      needsUserCheck: candidate.needsUserCheck
    }))
  });
}

export function buildDateLogExtractionPrompt(text: string, referenceDate: string): string {
  return JSON.stringify({
    task: 'extract_date_log',
    language: 'ko',
    timezone: 'Asia/Seoul',
    referenceDate,
    input: text
  });
}
