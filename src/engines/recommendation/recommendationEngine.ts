import type { Anniversary } from '../../domain/anniversary.js';
import type { DateItem } from '../../domain/dateItem.js';
import type { WeatherHint } from '../../adapters/weather/weatherAdapter.js';
import { buildRecommendationContext, type RecommendationContext } from './contextBuilder.js';
import { scoreDateItems } from './scoring.js';

export function createRecommendationContext(input: {
  userRequest: string;
  dateItems: DateItem[];
  anniversaries: Anniversary[];
  weather: WeatherHint;
}): RecommendationContext {
  const candidates = scoreDateItems(input.dateItems, input.weather);
  return buildRecommendationContext({
    userRequest: input.userRequest,
    weather: input.weather,
    anniversaries: input.anniversaries,
    candidates
  });
}
