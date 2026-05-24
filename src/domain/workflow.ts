export type DateIntent = 'recommendation' | 'date_log' | 'unknown';

export interface WorkflowContext {
  requestId: string;
  userId: string;
  channelId: string;
  text: string;
}
