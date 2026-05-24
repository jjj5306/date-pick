import type { StructuredDateLog } from './dateItem.js';

export type PendingWriteAction = 'save_date_log';

export interface PendingWrite {
  id: string;
  userId: string;
  channelId: string;
  action: PendingWriteAction;
  payload: StructuredDateLog;
  expiresAt: string;
  createdAt: string;
}
