import type { WeatherHint } from '../../adapters/weather/weatherAdapter.js';
import type { DateItem } from '../../domain/dateItem.js';
import type { RecommendationCandidate } from '../../domain/recommendation.js';

const priorityScore: Record<DateItem['priority'], number> = {
  low: 5,
  medium: 15,
  high: 30
};

export function scoreDateItems(items: DateItem[], weather: WeatherHint): RecommendationCandidate[] {
  const completedByCategory = new Map<DateItem['category'], string[]>();
  for (const item of items) {
    if (item.status === 'completed') {
      completedByCategory.set(item.category, [...completedByCategory.get(item.category) ?? [], item.title]);
    }
  }

  return items
    .filter((item) => item.status !== 'completed')
    .map((item) => {
      let score = 50 + priorityScore[item.priority];
      const similarCompletedTitles = completedByCategory.get(item.category)?.slice(0, 2) ?? [];

      if (similarCompletedTitles.length > 0) {
        score -= 15;
      }

      if (item.estimatedCost !== undefined && item.estimatedCost <= 100000) {
        score += 10;
      }

      return {
        item,
        score,
        similarCompletedTitles,
        needsUserCheck: weather.needsUserCheck || !item.location
      };
    })
    .sort((left, right) => right.score - left.score);
}
