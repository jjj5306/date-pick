import { describe, expect, test } from 'vitest';
import { fillDateFromUserText, inferDateFromKoreanText } from '../../../../src/adapters/openai/openaiDateInference.js';

describe('Korean date inference', () => {
  test('infers common relative Korean date words', () => {
    expect(inferDateFromKoreanText('오늘 성수에서 전시', '2026-05-24')).toBe('2026-05-24');
    expect(inferDateFromKoreanText('어제 성수에서 전시', '2026-05-24')).toBe('2026-05-23');
    expect(inferDateFromKoreanText('그저께 성수에서 전시', '2026-05-24')).toBe('2026-05-22');
  });

  test('infers month and day using the reference year', () => {
    expect(inferDateFromKoreanText('5월 3일에 성수에서 전시', '2026-05-24')).toBe('2026-05-03');
    expect(inferDateFromKoreanText('4월 11일에 청수에서 소공하고 와인 먹었어', '2026-05-24')).toBe('2026-04-11');
    expect(inferDateFromKoreanText('4/11 청수에서 소공하고 와인', '2026-05-24')).toBe('2026-04-11');
    expect(inferDateFromKoreanText('2025년 4월 11일 청수에서 소공하고 와인', '2026-05-24')).toBe('2025-04-11');
  });

  test('keeps explicit OpenAI date and only fills missing dates', () => {
    expect(fillDateFromUserText({
      title: '성수 데이트',
      date: '2026-05-20',
      category: 'date',
      missingFields: []
    }, '오늘 성수', '2026-05-24').date).toBe('2026-05-20');
  });

  test('normalizes non-ISO OpenAI date from the original text', () => {
    expect(fillDateFromUserText({
      title: '청수 데이트',
      date: '4월 11일',
      category: 'date',
      missingFields: []
    }, '청수에서 소공하고 와인 먹었어', '2026-05-24').date).toBe('2026-04-11');
  });
});
