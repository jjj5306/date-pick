import { describe, expect, test, vi } from 'vitest';
import {
  OpenAIClientAdapter,
  type OpenAIChatApiClient
} from '../../../../src/adapters/openai/openaiClient.js';

describe('OpenAIClientAdapter', () => {
  test('calls OpenAI chat completions with JSON response format in generateRecommendationResponse', async () => {
    const client = createClient({
      summary: '추천 완료',
      items: [{
        title: '성수 전시',
        reason: '비 오는 날 실내라 좋아요.',
        confidence: 'high',
        needsUserCheck: false,
        notionSourceUrls: ['https://notion.test/date']
      }]
    });
    const adapter = new OpenAIClientAdapter('test-key', 'gpt-test', client);

    await expect(adapter.generateRecommendationResponse({
      userRequest: '이번 주말 추천',
      weather: {
        available: false,
        condition: 'unknown',
        indoorOutdoorHint: 'unknown',
        needsUserCheck: true
      },
      anniversaries: [{ title: '1000일', date: '2026-06-01', type: 'anniversary' }],
      candidates: [{
        title: '성수 전시',
        category: 'date',
        location: '성수',
        estimatedCost: 80000,
        sourceUrl: 'https://notion.test/date',
        reasons: ['high priority'],
        needsUserCheck: false
      }]
    })).resolves.toMatchObject({ summary: '추천 완료' });

    expect(client.chat.completions.create).toHaveBeenCalledTimes(1);
    expect(client.chat.completions.create).toHaveBeenCalledWith(expect.objectContaining({
      model: 'gpt-test',
      response_format: { type: 'json_object' },
      messages: [expect.objectContaining({
        role: 'user',
        content: expect.stringContaining('이번 주말 추천')
      })]
    }));
  });

  test('calls OpenAI chat completions with JSON response format in extractDateLog', async () => {
    const client = createClient({
      title: '성수 데이트',
      date: '2026-05-24',
      category: 'date',
      location: '성수',
      cost: 110000,
      notes: '전시 후 파스타',
      missingFields: [],
      nextRecommendationHints: ['실내 전시 선호']
    });
    const adapter = new OpenAIClientAdapter('test-key', 'gpt-test', client, () => new Date('2026-05-24T12:00:00.000+09:00'));

    await expect(adapter.extractDateLog('오늘 성수에서 전시 보고 파스타 먹었어')).resolves.toMatchObject({
      title: '성수 데이트',
      date: '2026-05-24',
      location: '성수'
    });

    expect(client.chat.completions.create).toHaveBeenCalledTimes(1);
    expect(client.chat.completions.create).toHaveBeenCalledWith(expect.objectContaining({
      model: 'gpt-test',
      response_format: { type: 'json_object' },
      messages: [expect.objectContaining({
        role: 'user',
        content: expect.stringContaining('2026-05-24')
      })]
    }));
  });

  test('fills date from Korean relative text when OpenAI leaves date empty', async () => {
    const client = createClient({
      title: '성수 데이트',
      date: '',
      category: 'date',
      location: '성수',
      missingFields: ['date'],
      nextRecommendationHints: []
    });
    const adapter = new OpenAIClientAdapter('test-key', 'gpt-test', client, () => new Date('2026-05-24T12:00:00.000+09:00'));

    await expect(adapter.extractDateLog('어제 성수에서 전시 보고 파스타 먹었어')).resolves.toMatchObject({
      date: '2026-05-23',
      missingFields: []
    });
  });

  test('fills month-day dates from user text when OpenAI leaves date empty', async () => {
    const client = createClient({
      title: '청수 데이트',
      date: '',
      category: 'date',
      location: '청수',
      missingFields: ['date'],
      nextRecommendationHints: []
    });
    const adapter = new OpenAIClientAdapter('test-key', 'gpt-test', client, () => new Date('2026-05-24T12:00:00.000+09:00'));

    await expect(adapter.extractDateLog('4월 11일에 청수에서 소공하고 와인 먹었어')).resolves.toMatchObject({
      date: '2026-04-11',
      missingFields: []
    });
  });
});

function createClient(responseJson: unknown): OpenAIChatApiClient {
  return {
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{ message: { content: JSON.stringify(responseJson) } }]
        })
      }
    }
  };
}
