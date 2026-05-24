import { describe, expect, test, vi } from 'vitest';
import { buildEditPendingWriteMessage, handleCancelPendingWrite, handleSavePendingWrite } from '../../../src/slack/interactions.js';

vi.mock('../../../src/config/logger.js', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn()
  }
}));

describe('slack interactions', () => {
  test('saves approved pending writes through the save workflow', async () => {
    const response = await handleSavePendingWrite('pending-1', {
      pendingWriteStore: {
        findById: vi.fn().mockReturnValue({
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
        }),
        deleteById: vi.fn()
      },
      notionRepository: {
        listDateItems: vi.fn(),
        listAnniversaries: vi.fn(),
        saveDateLog: vi.fn().mockResolvedValue({ url: 'https://notion.test/page' })
      }
    });

    expect(response).toMatchObject({
      response_type: 'in_channel',
      replace_original: true,
      text: 'Notion에 저장했어요: https://notion.test/page'
    });
    expect(JSON.stringify(response)).toContain('성수 데이트');
    expect(JSON.stringify(response)).toContain('https://notion.test/page');
  });

  test('returns a retryable Notion setup message when saving fails', async () => {
    const deleteById = vi.fn();
    const response = await handleSavePendingWrite('pending-1', {
      pendingWriteStore: {
        findById: vi.fn().mockReturnValue({
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
        }),
        deleteById
      },
      notionRepository: {
        listDateItems: vi.fn(),
        listAnniversaries: vi.fn(),
        saveDateLog: vi.fn().mockRejectedValue(new Error('notion object_not_found'))
      }
    });

    expect(response).toContain('Notion에 저장하지 못했어요.');
    expect(response).toContain('저장을 다시 눌러 주세요.');
    expect(deleteById).not.toHaveBeenCalled();
  });

  test('returns an expired pending write message when the preview is gone', async () => {
    const response = await handleSavePendingWrite('pending-1', {
      pendingWriteStore: {
        findById: vi.fn().mockReturnValue(undefined),
        deleteById: vi.fn()
      },
      notionRepository: {
        listDateItems: vi.fn(),
        listAnniversaries: vi.fn(),
        saveDateLog: vi.fn()
      }
    });

    expect(response).toContain('저장할 대기 항목을 찾지 못했어요.');
  });

  test('cancels pending writes without calling Notion', () => {
    const deleteById = vi.fn();

    expect(handleCancelPendingWrite('pending-1', {
      pendingWriteStore: {
        findById: vi.fn(),
        deleteById
      }
    })).toBe('저장을 취소했어요.');
    expect(deleteById).toHaveBeenCalledWith('pending-1');
  });

  test('returns a clear message for the MVP edit placeholder', () => {
    expect(buildEditPendingWriteMessage()).toContain('MVP');
  });
});
