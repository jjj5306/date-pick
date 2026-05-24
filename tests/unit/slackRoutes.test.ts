import { describe, expect, test, vi } from 'vitest';
import { classifyDateIntent, handleDateCommand } from '../../src/slack/routes.js';

describe('slack routes', () => {
  test('classifies /date text into workflow intents', () => {
    expect(classifyDateIntent('이번 주말 추천')).toBe('recommendation');
    expect(classifyDateIntent('기록 오늘 성수에서 전시')).toBe('date_log');
    expect(classifyDateIntent('')).toBe('unknown');
  });

  test('routes recommendation requests to the recommendation workflow path', async () => {
    const response = await handleDateCommand({
      requestId: 'r1',
      userId: 'U1',
      channelId: 'C1',
      text: '추천'
    }, {
      notionRepository: {
        listDateItems: vi.fn().mockResolvedValue([{ id: '1', title: '전시', category: 'date', status: 'not_started', priority: 'high' }]),
        listAnniversaries: vi.fn().mockResolvedValue([]),
        saveDateLog: vi.fn()
      },
      weatherAdapter: {
        getWeatherHint: vi.fn().mockResolvedValue({ available: false, condition: 'unknown', indoorOutdoorHint: 'unknown', needsUserCheck: true })
      },
      pendingWriteStore: {
        create: vi.fn(),
        findById: vi.fn(),
        deleteById: vi.fn()
      },
      openAIAdapter: {
        generateRecommendationResponse: vi.fn().mockResolvedValue({
          summary: '추천',
          items: [{ title: '전시', reason: '좋아요', confidence: 'medium', needsUserCheck: true, notionSourceUrls: [] }]
        }),
        extractDateLog: vi.fn()
      }
    });

    expect(response.text).toBe('추천');
    expect(response.blocks).toBeDefined();
  });
});
