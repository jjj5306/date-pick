import { describe, expect, test } from 'vitest';
import { parseRecommendationResponse, parseStructuredDateLog, RetryableOpenAIResponseError } from '../../../../src/adapters/openai/openaiSchemas.js';

describe('openaiSchemas', () => {
  test('parses a valid recommendation response', () => {
    expect(parseRecommendationResponse({
      summary: '세 가지를 골랐어요.',
      items: [{
        title: '성수 전시',
        reason: '실내라 좋아요.',
        confidence: 'high',
        needsUserCheck: false,
        notionSourceUrls: []
      }]
    }).items[0].title).toBe('성수 전시');
  });

  test('accepts incomplete date logs and keeps missing fields visible', () => {
    expect(parseStructuredDateLog({
      title: '성수 데이트',
      category: '데이트',
      missingFields: ['date']
    })).toMatchObject({
      title: '성수 데이트',
      date: '',
      category: 'date',
      missingFields: ['date']
    });
  });

  test('turns invalid JSON shape into a retryable error', () => {
    expect(() => parseStructuredDateLog(null)).toThrow(RetryableOpenAIResponseError);
  });
});
