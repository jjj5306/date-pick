import { describe, expect, test, vi } from 'vitest';
import { handleNoteCommand, handleRecommendCommand } from '../../../src/slack/routes.js';

describe('slack routes', () => {
  test('routes /date-recommend requests to the recommendation workflow path', async () => {
    const response = await handleRecommendCommand({
      requestId: 'r1',
      userId: 'U1',
      channelId: 'C1',
      text: '이번 주말 추천',
      command: '/date-recommend'
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

    expect(response.response_type).toBe('in_channel');
    expect(response.text).toBe('추천');
    expect(response.blocks).toBeDefined();
    expect(JSON.stringify(response.blocks)).toContain('/date-recommend 이번 주말 추천');
  });

  test('routes /date-note requests to the note workflow path', async () => {
    const create = vi.fn().mockReturnValue({
      id: 'pending-1',
      userId: 'U1',
      channelId: 'C1',
      action: 'save_date_log',
      payload: {
        title: '성수 데이트',
        date: '2026-05-24',
        category: 'date',
        missingFields: []
      },
      expiresAt: '2099-01-01T00:00:00.000Z',
      createdAt: '2026-05-24T00:00:00.000Z'
    });

    const response = await handleNoteCommand({
      requestId: 'r1',
      userId: 'U1',
      channelId: 'C1',
      text: '오늘 성수에서 전시',
      command: '/date-note'
    }, {
      notionRepository: {
        listDateItems: vi.fn(),
        listAnniversaries: vi.fn(),
        saveDateLog: vi.fn()
      },
      weatherAdapter: {
        getWeatherHint: vi.fn()
      },
      pendingWriteStore: {
        create,
        findById: vi.fn(),
        deleteById: vi.fn()
      },
      openAIAdapter: {
        generateRecommendationResponse: vi.fn(),
        extractDateLog: vi.fn().mockResolvedValue({
          title: '성수 데이트',
          date: '2026-05-24',
          category: 'date',
          missingFields: []
        })
      }
    });

    expect(response.response_type).toBe('in_channel');
    expect(response.text).toBe('저장 전 내용을 확인해 주세요.');
    expect(create).toHaveBeenCalled();
    expect(JSON.stringify(response.blocks)).toContain('/date-note 오늘 성수에서 전시');
  });
});
