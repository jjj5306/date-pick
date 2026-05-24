import { describe, expect, test, vi } from 'vitest';
import { applyMigrations, openSqlite } from '../../../src/storage/sqlite.js';
import { PendingWriteStore } from '../../../src/storage/pendingWriteStore.js';
import { runSaveWorkflow } from '../../../src/workflows/saveWorkflow.js';

describe('runSaveWorkflow', () => {
  test('saves an approved pending write to Notion and deletes it', async () => {
    const database = await openSqlite(':memory:');
    applyMigrations(database);
    const pendingWriteStore = new PendingWriteStore(database);
    const pendingWrite = pendingWriteStore.create({
      userId: 'U1',
      channelId: 'C1',
      action: 'save_date_log',
      payload: {
        title: '성수 데이트',
        date: '2026-05-24',
        category: 'date',
        missingFields: [],
        nextRecommendationHints: []
      }
    });

    const result = await runSaveWorkflow(pendingWrite.id, {
      pendingWriteStore,
      notionRepository: {
        listDateItems: vi.fn(),
        listAnniversaries: vi.fn(),
        saveDateLog: vi.fn().mockResolvedValue({ url: 'https://notion.test/page' })
      }
    });

    expect(result.url).toBe('https://notion.test/page');
    expect(pendingWriteStore.findById(pendingWrite.id)).toBeUndefined();
  });

  test('keeps the pending write when Notion rejects the save request', async () => {
    const database = await openSqlite(':memory:');
    applyMigrations(database);
    const pendingWriteStore = new PendingWriteStore(database);
    const pendingWrite = pendingWriteStore.create({
      userId: 'U1',
      channelId: 'C1',
      action: 'save_date_log',
      payload: {
        title: '성수 데이트',
        date: '2026-05-24',
        category: 'date',
        missingFields: [],
        nextRecommendationHints: []
      }
    });

    await expect(runSaveWorkflow(pendingWrite.id, {
      pendingWriteStore,
      notionRepository: {
        listDateItems: vi.fn(),
        listAnniversaries: vi.fn(),
        saveDateLog: vi.fn().mockRejectedValue(new Error('notion object_not_found'))
      }
    })).rejects.toThrow('notion object_not_found');

    expect(pendingWriteStore.findById(pendingWrite.id)?.payload.title).toBe('성수 데이트');
  });
});
