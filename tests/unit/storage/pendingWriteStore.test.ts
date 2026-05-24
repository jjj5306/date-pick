import { describe, expect, test } from 'vitest';
import { applyMigrations, openSqlite } from '../../../src/storage/sqlite.js';
import { PendingWriteStore } from '../../../src/storage/pendingWriteStore.js';

async function createStore(ttlMs = 30 * 60 * 1000): Promise<PendingWriteStore> {
  const database = await openSqlite(':memory:');
  applyMigrations(database);
  return new PendingWriteStore(database, ttlMs);
}

describe('PendingWriteStore', () => {
  test('creates and reads a pending write', async () => {
    const store = await createStore();
    const created = store.create({
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

    expect(store.findById(created.id)?.payload.title).toBe('성수 데이트');
  });

  test('does not return expired pending writes and can delete expired rows', async () => {
    const store = await createStore(-1);
    const created = store.create({
      userId: 'U1',
      channelId: 'C1',
      action: 'save_date_log',
      payload: {
        title: '만료',
        date: '2026-05-24',
        category: 'date',
        missingFields: [],
        nextRecommendationHints: []
      }
    });

    expect(store.findById(created.id)).toBeUndefined();
    expect(store.deleteExpired()).toBe(0);
  });
});
