import { describe, expect, test, vi } from 'vitest';
import { buildEditPendingWriteMessage, handleCancelPendingWrite, handleSavePendingWrite } from '../../../src/slack/interactions.js';

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

    expect(response).toContain('https://notion.test/page');
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
