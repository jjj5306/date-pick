import type { StructuredDateLog } from './dateItem.js';

export type PendingWriteAction = 'save_date_log';

export interface PendingWriteRequest {
  command: string;
  text: string;
}

export interface PendingWrite {
  id: string;
  userId: string;
  channelId: string;
  action: PendingWriteAction;
  payload: StructuredDateLog;
  request?: PendingWriteRequest;
  expiresAt: string;
  createdAt: string;
}
