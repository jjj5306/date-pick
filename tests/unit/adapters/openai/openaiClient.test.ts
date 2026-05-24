import { describe, expect, test, vi } from 'vitest';
import {
  OpenAIClientAdapter,
  type OpenAIChatApiClient
} from '../../../../src/adapters/openai/openaiClient.js';

describe('OpenAIClientAdapter', () => {
  test('calls OpenAI chat completions with JSON response format in generateRecommendationResponse', async () => {
    const client = createClient({
      summary: 'recommendation done',
      items: [{
        title: 'gallery date',
        reason: 'good indoor option',
        confidence: 'high',
        needsUserCheck: false,
        notionSourceUrls: ['https://notion.test/date']
      }]
    });
    const adapter = new OpenAIClientAdapter('test-key', 'gpt-test', client);

    await expect(adapter.generateRecommendationResponse({
      userRequest: 'recommend this weekend',
      weather: {
        available: false,
        condition: 'unknown',
        indoorOutdoorHint: 'unknown',
        needsUserCheck: true
      },
      anniversaries: [{ title: '1000 days', date: '2026-06-01', type: 'anniversary' }],
      candidates: [{
        title: 'gallery date',
        category: 'date',
        location: 'Seongsu',
        estimatedCost: 80000,
        sourceUrl: 'https://notion.test/date',
        reasons: ['high priority'],
        needsUserCheck: false
      }]
    })).resolves.toMatchObject({ summary: 'recommendation done' });

    expect(client.chat.completions.create).toHaveBeenCalledTimes(1);
    expect(client.chat.completions.create).toHaveBeenCalledWith(expect.objectContaining({
      model: 'gpt-test',
      response_format: { type: 'json_object' },
      messages: [expect.objectContaining({
        role: 'user',
        content: expect.stringContaining('recommend this weekend')
      })]
    }));
    expect(getLastMessageContent(client)).toMatch(/json/i);
    expect(getLastMessageContent(client)).toContain('notionSourceUrls');
    expect(getLastMessageContent(client)).toContain('https://notion.test/date');
  });

  test('calls OpenAI chat completions with JSON response format in extractDateLog', async () => {
    const client = createClient({
      title: 'Seongsu date',
      date: '2026-05-24',
      category: 'date',
      location: 'Seongsu',
      cost: 110000,
      notes: 'exhibition and pasta',
      missingFields: [],
      nextRecommendationHints: ['indoor exhibition']
    });
    const adapter = new OpenAIClientAdapter('test-key', 'gpt-test', client, () => new Date('2026-05-24T12:00:00.000+09:00'));

    await expect(adapter.extractDateLog('today exhibition in Seongsu')).resolves.toMatchObject({
      title: 'Seongsu date',
      date: '2026-05-24',
      location: 'Seongsu'
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
    expect(getLastMessageContent(client)).toMatch(/json/i);
  });

  test('fills date from Korean relative text when OpenAI leaves date empty', async () => {
    const client = createClient({
      title: 'Seongsu date',
      date: '',
      category: 'date',
      location: 'Seongsu',
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
      title: 'Cheongsu date',
      date: '',
      category: 'date',
      location: 'Cheongsu',
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

function getLastMessageContent(client: OpenAIChatApiClient): string {
  const [input] = vi.mocked(client.chat.completions.create).mock.lastCall ?? [];
  return input?.messages[0]?.content ?? '';
}
