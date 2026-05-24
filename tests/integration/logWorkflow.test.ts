import { describe, expect, test, vi } from 'vitest';
import { applyMigrations, openSqlite } from '../../src/storage/sqlite.js';
import { PendingWriteStore } from '../../src/storage/pendingWriteStore.js';
import { runLogWorkflow } from '../../src/workflows/logWorkflow.js';

describe('runLogWorkflow', () => {
  test('extracts a date log and stores it as a pending write', async () => {
    const database = await openSqlite(':memory:');
    applyMigrations(database);
    const pendingWriteStore = new PendingWriteStore(database);

    const pendingWrite = await runLogWorkflow({
      requestId: 'r1',
      userId: 'U1',
      channelId: 'C1',
      text: '기록 오늘 성수'
    }, {
      pendingWriteStore,
      openAIAdapter: {
        generateRecommendationResponse: vi.fn(),
        extractDateLog: vi.fn().mockResolvedValue({
          title: '성수 데이트',
          date: '2026-05-24',
          category: 'date',
          location: '성수',
          missingFields: [],
          nextRecommendationHints: []
        })
      }
    });

    expect(pendingWriteStore.findById(pendingWrite.id)?.payload.title).toBe('성수 데이트');
  });
});
