import { describe, expect, test } from 'vitest';
import type { DateItem } from '../../../../src/domain/dateItem.js';
import { scoreDateItems } from '../../../../src/engines/recommendation/scoring.js';

const items: DateItem[] = [
  { id: '1', title: '완료한 맛집', category: 'restaurant', status: 'completed', priority: 'medium' },
  { id: '2', title: '성수 전시', category: 'date', status: 'not_started', priority: 'high', estimatedCost: 50000, location: '성수' },
  { id: '3', title: '다른 맛집', category: 'restaurant', status: 'not_started', priority: 'medium', estimatedCost: 40000, location: '망원' },
  { id: '4', title: '정보 부족', category: 'other', status: 'not_started', priority: 'low' }
];

describe('scoreDateItems', () => {
  test('excludes completed items and returns highest scoring candidates first', () => {
    const scored = scoreDateItems(items, {
      available: false,
      condition: 'unknown',
      indoorOutdoorHint: 'unknown',
      needsUserCheck: true
    });

    expect(scored).toHaveLength(3);
    expect(scored[0].item.title).toBe('성수 전시');
    expect(scored.map((candidate) => candidate.item.title)).not.toContain('완료한 맛집');
  });

  test('passes similar completed titles without exposing internal scoring reasons', () => {
    const scored = scoreDateItems(items, {
      available: true,
      condition: 'clear',
      indoorOutdoorHint: 'outdoor',
      needsUserCheck: false
    });

    const restaurant = scored.find((candidate) => candidate.item.title === '다른 맛집');
    expect(restaurant?.similarCompletedTitles).toEqual(['완료한 맛집']);
    expect(restaurant).not.toHaveProperty('reasons');
  });
});
