import { describe, expect, test } from 'vitest';
import {
  parseRecommendationResponse,
  parseStructuredDateLog,
  RetryableOpenAIResponseError
} from '../../../../src/adapters/openai/openaiSchemas.js';

describe('openaiSchemas', () => {
  test('parses a strict recommendation response', () => {
    expect(parseRecommendationResponse({
      summary: 'Two options look good.',
      items: [{
        title: 'Gallery date',
        reason: 'Good indoor option.',
        estimatedCostMin: null,
        estimatedCostMax: null,
        weatherFit: null,
        noveltyReason: null,
        confidence: 'high',
        needsUserCheck: false,
        notionSourceUrls: []
      }]
    })).toMatchObject({
      summary: 'Two options look good.',
      items: [{
        title: 'Gallery date',
        reason: 'Good indoor option.',
        confidence: 'high',
        needsUserCheck: false,
        notionSourceUrls: []
      }]
    });
  });

  test('parses a strict date log response', () => {
    expect(parseStructuredDateLog({
      title: 'Seongsu date',
      date: '2026-05-23',
      category: 'date',
      location: null,
      indoorOutdoor: null,
      cost: null,
      sentiment: null,
      notes: null,
      nextRecommendationHints: [],
      missingFields: []
    })).toMatchObject({
      title: 'Seongsu date',
      date: '2026-05-23',
      category: 'date',
      missingFields: []
    });
  });

  test('turns invalid JSON shape into a retryable error', () => {
    expect(() => parseStructuredDateLog(null)).toThrow(RetryableOpenAIResponseError);
    expect(() => parseStructuredDateLog({
      title: 'Seongsu date',
      category: 'date',
      missingFields: ['date']
    })).toThrow(RetryableOpenAIResponseError);
    expect(() => parseRecommendationResponse(null)).toThrow(RetryableOpenAIResponseError);
  });
});
