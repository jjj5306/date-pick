import { describe, expect, test } from 'vitest';
import { scoreDateItems } from '../../src/engines/recommendation/scoring.js';
import type { DateItem } from '../../src/domain/dateItem.js';

const items: DateItem[] = [
  { id: '1', title: '완료한 맛집', category: 'restaurant', status: 'completed', priority: 'medium' },
  { id: '2', title: '새 전시', category: 'date', status: 'not_started', priority: 'high', estimatedCost: 50000, location: '성수' },
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
    expect(scored[0].item.title).toBe('새 전시');
    expect(scored.map((candidate) => candidate.item.title)).not.toContain('완료한 맛집');
  });

  test('marks incomplete or weather-unknown candidates as needing user check', () => {
    const scored = scoreDateItems(items, {
      available: false,
      condition: 'unknown',
      indoorOutdoorHint: 'unknown',
      needsUserCheck: true
    });

    expect(scored.every((candidate) => candidate.needsUserCheck)).toBe(true);
  });
});
