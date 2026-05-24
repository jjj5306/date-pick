import { describe, expect, test, vi } from 'vitest';
import { runRecommendationWorkflow } from '../../src/workflows/recommendationWorkflow.js';

describe('runRecommendationWorkflow', () => {
  test('builds compact recommendation context from Notion and weather mocks', async () => {
    const openAIAdapter = {
      generateRecommendationResponse: vi.fn().mockResolvedValue({ summary: '추천 완료', items: [] }),
      extractDateLog: vi.fn()
    };

    const result = await runRecommendationWorkflow({
      requestId: 'r1',
      userId: 'U1',
      channelId: 'C1',
      text: '이번 주말 추천'
    }, {
      notionRepository: {
        listDateItems: vi.fn().mockResolvedValue([
          { id: '1', title: '성수 전시', category: 'date', status: 'not_started', priority: 'high', location: '성수', estimatedCost: 50000 }
        ]),
        listAnniversaries: vi.fn().mockResolvedValue([]),
        saveDateLog: vi.fn()
      },
      weatherAdapter: {
        getWeatherHint: vi.fn().mockResolvedValue({ available: false, condition: 'unknown', indoorOutdoorHint: 'unknown', needsUserCheck: true })
      },
      openAIAdapter
    });

    expect(result.summary).toBe('추천 완료');
    expect(openAIAdapter.generateRecommendationResponse).toHaveBeenCalledWith(expect.objectContaining({
      candidates: [expect.objectContaining({ title: '성수 전시' })]
    }));
  });
});
