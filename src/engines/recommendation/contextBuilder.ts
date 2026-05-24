import type { Anniversary } from '../../domain/anniversary.js';
import type { RecommendationCandidate } from '../../domain/recommendation.js';
import type { WeatherHint } from '../../adapters/weather/weatherAdapter.js';

export interface RecommendationContextCandidate {
  title: string;
  category: string;
  location?: string;
  estimatedCost?: number;
  sourceUrl?: string;
  reasons: string[];
  needsUserCheck: boolean;
}

export interface RecommendationContext {
  userRequest: string;
  weather: WeatherHint;
  anniversaries: Array<Pick<Anniversary, 'title' | 'date' | 'type'>>;
  candidates: RecommendationContextCandidate[];
}

export function buildRecommendationContext(input: {
  userRequest: string;
  weather: WeatherHint;
  anniversaries: Anniversary[];
  candidates: RecommendationCandidate[];
}): RecommendationContext {
  return {
    userRequest: input.userRequest.slice(0, 500),
    weather: input.weather,
    anniversaries: input.anniversaries.slice(0, 5).map((anniversary) => ({
      title: anniversary.title,
      date: anniversary.date,
      type: anniversary.type
    })),
    candidates: input.candidates.slice(0, 3).map((candidate) => ({
      title: candidate.item.title,
      category: candidate.item.category,
      location: candidate.item.location,
      estimatedCost: candidate.item.estimatedCost,
      sourceUrl: candidate.item.sourceUrl,
      reasons: candidate.reasons,
      needsUserCheck: candidate.needsUserCheck
    }))
  };
}
