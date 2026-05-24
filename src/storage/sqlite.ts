import initSqlJs, { type Database, type SqlJsStatic } from 'sql.js';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export class SqliteDatabase {
  constructor(
    private readonly database: Database,
    private readonly path: string
  ) {}

  exec(sql: string): void {
    this.database.exec(sql);
    this.persist();
  }

  insertPendingWrite(row: {
    id: string;
    userId: string;
    channelId: string;
    action: string;
    payloadJson: string;
    expiresAt: string;
    createdAt: string;
  }): void {
    const statement = this.database.prepare(`
      insert into pending_writes (id, user_id, channel_id, action, payload_json, expires_at, created_at)
      values (?, ?, ?, ?, ?, ?, ?)
    `);
    try {
      statement.run([row.id, row.userId, row.channelId, row.action, row.payloadJson, row.expiresAt, row.createdAt]);
    } finally {
      statement.free();
    }
    this.persist();
  }

  findPendingWriteById(id: string): PendingWriteRow | undefined {
    const statement = this.database.prepare('select * from pending_writes where id = ?');
    try {
      statement.bind([id]);
      if (!statement.step()) {
        return undefined;
      }
      return statement.getAsObject() as unknown as PendingWriteRow;
    } finally {
      statement.free();
    }
  }

  deletePendingWriteById(id: string): void {
    this.database.run('delete from pending_writes where id = ?', [id]);
    this.persist();
  }

  deleteExpiredPendingWrites(nowIso: string): number {
    this.database.run('delete from pending_writes where expires_at <= ?', [nowIso]);
    const changes = this.database.getRowsModified();
    this.persist();
    return changes;
  }

  private persist(): void {
    if (this.path === ':memory:') {
      return;
    }
    writeFileSync(this.path, Buffer.from(this.database.export()));
  }
}

export interface PendingWriteRow {
  id: string;
  user_id: string;
  channel_id: string;
  action: string;
  payload_json: string;
  expires_at: string;
  created_at: string;
}

export async function openSqlite(path: string): Promise<SqliteDatabase> {
  const SQL = await loadSqlJs();
  const database = path !== ':memory:' && existsSync(path)
    ? new SQL.Database(readFileSync(path))
    : new SQL.Database();
  return new SqliteDatabase(database, path);
}

export function applyMigrations(database: SqliteDatabase): void {
  const migrationPath = join(dirname(fileURLToPath(import.meta.url)), 'migrations', '001_create_pending_writes.sql');
  database.exec(readFileSync(migrationPath, 'utf8'));
}

async function loadSqlJs(): Promise<SqlJsStatic> {
  const moduleDir = dirname(fileURLToPath(import.meta.url));
  return initSqlJs({
    locateFile: (file) => join(moduleDir, '..', '..', 'node_modules', 'sql.js', 'dist', file)
  });
}
