import { describe, expect, test } from 'vitest';
import { formatDateInSeoul } from '../../../../src/adapters/openai/openaiDateInference.js';

describe('formatDateInSeoul', () => {
  test('formats the reference date in Asia/Seoul', () => {
    expect(formatDateInSeoul(new Date('2026-05-23T15:30:00.000Z'))).toBe('2026-05-24');
  });
});
