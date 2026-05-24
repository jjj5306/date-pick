import type { DateItem } from '../../domain/dateItem.js';
import type { RecommendationCandidate } from '../../domain/recommendation.js';
import type { WeatherHint } from '../../adapters/weather/weatherAdapter.js';

const priorityScore: Record<DateItem['priority'], number> = {
  low: 5,
  medium: 15,
  high: 30
};

export function scoreDateItems(items: DateItem[], weather: WeatherHint): RecommendationCandidate[] {
  const completedCategories = new Set(items.filter((item) => item.status === 'completed').map((item) => item.category));

  return items
    .filter((item) => item.status !== 'completed')
    .map((item) => {
      const reasons = [`우선순위 ${item.priority}`];
      let score = 50 + priorityScore[item.priority];

      if (completedCategories.has(item.category)) {
        score -= 15;
        reasons.push('최근 완료한 분류와 겹쳐 감점');
      }

      if (item.estimatedCost !== undefined && item.estimatedCost <= 100000) {
        score += 10;
        reasons.push('예산 부담 낮음');
      }

      const needsUserCheck = weather.needsUserCheck || !item.location || item.estimatedCost === undefined;
      if (needsUserCheck) {
        reasons.push('일부 정보 확인 필요');
      }

      return { item, score, reasons, needsUserCheck };
    })
    .sort((left, right) => right.score - left.score);
}
