import { describe, expect, test } from 'vitest';
import { buildRecommendationContext } from '../../src/engines/recommendation/contextBuilder.js';

describe('buildRecommendationContext', () => {
  test('limits compact OpenAI context to the top three candidates', () => {
    const context = buildRecommendationContext({
      userRequest: '이번 주말 추천해줘'.repeat(100),
      weather: { available: false, condition: 'unknown', indoorOutdoorHint: 'unknown', needsUserCheck: true },
      anniversaries: [],
      candidates: Array.from({ length: 5 }, (_, index) => ({
        score: 100 - index,
        reasons: ['test'],
        needsUserCheck: false,
        item: {
          id: `${index}`,
          title: `후보 ${index}`,
          category: 'date' as const,
          status: 'not_started' as const,
          priority: 'medium' as const
        }
      }))
    });

    expect(context.candidates).toHaveLength(3);
    expect(context.userRequest.length).toBeLessThanOrEqual(500);
  });
});
