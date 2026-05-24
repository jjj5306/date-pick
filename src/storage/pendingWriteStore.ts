import { randomUUID } from 'node:crypto';
import type { PendingWrite } from '../domain/pendingWrite.js';
import type { PendingWriteRow, SqliteDatabase } from './sqlite.js';

const DEFAULT_TTL_MS = 30 * 60 * 1000;

export class PendingWriteStore {
  constructor(
    private readonly database: SqliteDatabase,
    private readonly ttlMs: number = DEFAULT_TTL_MS
  ) {}

  create(input: Pick<PendingWrite, 'userId' | 'channelId' | 'action' | 'payload' | 'request'>): PendingWrite {
    const now = new Date();
    const pendingWrite: PendingWrite = {
      id: randomUUID(),
      userId: input.userId,
      channelId: input.channelId,
      action: input.action,
      payload: input.payload,
      request: input.request,
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
      payloadJson: JSON.stringify({
        payload: pendingWrite.payload,
        request: pendingWrite.request
      })
    });

    return pendingWrite;
  }

  findById(id: string): PendingWrite | undefined {
    const row = this.database.findPendingWriteById(id);
    if (!row) {
      return undefined;
    }

    if (new Date(row.expires_at).getTime() <= Date.now()) {
      this.database.deletePendingWriteById(id);
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
  const stored = parseStoredPendingWrite(row.payload_json);
  return {
    id: row.id,
    userId: row.user_id,
    channelId: row.channel_id,
    action: row.action as PendingWrite['action'],
    payload: stored.payload,
    request: stored.request,
    expiresAt: row.expires_at,
    createdAt: row.created_at
  };
}

function parseStoredPendingWrite(payloadJson: string): Pick<PendingWrite, 'payload' | 'request'> {
  const parsed = JSON.parse(payloadJson) as PendingWrite['payload'] | Pick<PendingWrite, 'payload' | 'request'>;
  if (parsed && typeof parsed === 'object' && 'payload' in parsed) {
    return parsed as Pick<PendingWrite, 'payload' | 'request'>;
  }
  return { payload: parsed as PendingWrite['payload'] };
}
