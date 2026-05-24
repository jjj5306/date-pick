import { describe, expect, test } from 'vitest';
import {
  parseRecommendationResponse,
  parseStructuredDateLog,
  RetryableOpenAIResponseError
} from '../../../../src/adapters/openai/openaiSchemas.js';

describe('openaiSchemas', () => {
  test('parses a valid recommendation response', () => {
    expect(parseRecommendationResponse({
      summary: 'Two options look good.',
      items: [{
        title: 'Gallery date',
        reason: 'Good indoor option.',
        confidence: 'high',
        needsUserCheck: false,
        notionSourceUrls: []
      }]
    }).items[0].title).toBe('Gallery date');
  });

  test('normalizes common recommendation aliases and missing optional fields', () => {
    expect(parseRecommendationResponse({
      message: 'Two options look good.',
      recommendations: [{
        title: 'Wine bar',
        description: 'Good for an anniversary evening.',
        sources: ['https://notion.test/wine']
      }]
    })).toMatchObject({
      summary: 'Two options look good.',
      items: [{
        title: 'Wine bar',
        reason: 'Good for an anniversary evening.',
        confidence: 'medium',
        needsUserCheck: true,
        notionSourceUrls: ['https://notion.test/wine']
      }]
    });
  });

  test('accepts incomplete date logs and keeps missing fields visible', () => {
    expect(parseStructuredDateLog({
      title: 'Seongsu date',
      category: 'date',
      missingFields: ['date']
    })).toMatchObject({
      title: 'Seongsu date',
      date: '',
      category: 'date',
      missingFields: ['date']
    });
  });

  test('turns invalid JSON shape into a retryable error', () => {
    expect(() => parseStructuredDateLog(null)).toThrow(RetryableOpenAIResponseError);
    expect(() => parseRecommendationResponse(null)).toThrow(RetryableOpenAIResponseError);
  });
});
