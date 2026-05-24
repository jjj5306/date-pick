import { describe, expect, test, vi } from 'vitest';
import {
  OpenAIClientAdapter,
  type OpenAIChatApiClient
} from '../../../../src/adapters/openai/openaiClient.js';

describe('OpenAIClientAdapter', () => {
  test('requests strict structured output for recommendations with a minimal prompt', async () => {
    const client = createClient({
      summary: 'recommendation done',
      items: [{
        title: 'gallery date',
        reason: 'good indoor option',
        estimatedCostMin: null,
        estimatedCostMax: null,
        weatherFit: null,
        noveltyReason: null,
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

    const input = getLastCreateInput(client);
    expect(input).toMatchObject({
      model: 'gpt-test',
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'date_recommendation',
          strict: true
        }
      }
    });
    expect(input.messages[0]?.content).toContain('recommend_dates');
    expect(input.messages[0]?.content).toContain('https://notion.test/date');
    expect(input.messages[0]?.content).not.toContain('notionSourceUrls');
  });

  test('uses OpenAI structured date output without code-side date inference', async () => {
    const client = createClient({
      title: 'Seongsu date',
      date: '2026-05-23',
      category: 'date',
      location: 'Seongsu',
      indoorOutdoor: 'indoor',
      cost: 110000,
      sentiment: null,
      notes: 'exhibition and pasta',
      nextRecommendationHints: ['indoor exhibition'],
      missingFields: []
    });
    const adapter = new OpenAIClientAdapter('test-key', 'gpt-test', client, () => new Date('2026-05-24T12:00:00.000+09:00'));

    await expect(adapter.extractDateLog('어제 성수에서 전시 보고 파스타 먹었어')).resolves.toMatchObject({
      title: 'Seongsu date',
      date: '2026-05-23',
      location: 'Seongsu',
      missingFields: []
    });

    const input = getLastCreateInput(client);
    expect(input).toMatchObject({
      model: 'gpt-test',
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'date_log',
          strict: true
        }
      }
    });
    expect(input.messages[0]?.content).toContain('extract_date_log');
    expect(input.messages[0]?.content).toContain('2026-05-24');
    expect(input.messages[0]?.content).not.toContain('오늘');
    expect(input.messages[0]?.content).not.toContain('어제 means');
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

function getLastCreateInput(client: OpenAIChatApiClient) {
  const [input] = vi.mocked(client.chat.completions.create).mock.lastCall ?? [];
  if (!input) {
    throw new Error('OpenAI create was not called.');
  }
  return input;
}
