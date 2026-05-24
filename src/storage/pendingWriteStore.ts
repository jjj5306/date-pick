import { randomUUID } from 'node:crypto';
import type { PendingWrite } from '../domain/pendingWrite.js';
import type { PendingWriteRow, SqliteDatabase } from './sqlite.js';

const DEFAULT_TTL_MS = 30 * 60 * 1000;

export class PendingWriteStore {
  constructor(
    private readonly database: SqliteDatabase,
    private readonly ttlMs: number = DEFAULT_TTL_MS
  ) {}

  create(input: Pick<PendingWrite, 'userId' | 'channelId' | 'action' | 'payload'>): PendingWrite {
    const now = new Date();
    const pendingWrite: PendingWrite = {
      id: randomUUID(),
      userId: input.userId,
      channelId: input.channelId,
      action: input.action,
      payload: input.payload,
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + this.ttlMs).toISOString()
    };

    this.database.insertPendingWrite({
      id: pendingWrite.id,
      userId: pendingWrite.userId,
      channelId: pendingWrite.channelId,
      action: pendingWrite.action,
      expiresAt: pendingWrite.expiresAt,
      createdAt: pendingWrite.createdAt,
      payloadJson: JSON.stringify(pendingWrite.payload)
    });

    return pendingWrite;
  }

  findById(id: string): PendingWrite | undefined {
    const row = this.database.findPendingWriteById(id);
    if (!row || new Date(row.expires_at).getTime() <= Date.now()) {
      return undefined;
    }

    return mapRow(row);
  }

  deleteById(id: string): void {
    this.database.deletePendingWriteById(id);
  }

  deleteExpired(now: Date = new Date()): number {
    return this.database.deleteExpiredPendingWrites(now.toISOString());
  }
}

function mapRow(row: PendingWriteRow): PendingWrite {
  return {
    id: row.id,
    userId: row.user_id,
    channelId: row.channel_id,
    action: row.action as PendingWrite['action'],
    payload: JSON.parse(row.payload_json) as PendingWrite['payload'],
    expiresAt: row.expires_at,
    createdAt: row.created_at
  };
}
