import type { OpenAIAdapter } from '../adapters/openai/openaiClient.js';
import type { PendingWrite } from '../domain/pendingWrite.js';
import type { WorkflowContext } from '../domain/workflow.js';

export interface PendingWriteCreator {
  create(input: Pick<PendingWrite, 'userId' | 'channelId' | 'action' | 'payload'>): PendingWrite;
}

export interface LogWorkflowDependencies {
  openAIAdapter: OpenAIAdapter;
  pendingWriteStore: PendingWriteCreator;
}

export async function runLogWorkflow(
  context: WorkflowContext,
  dependencies: LogWorkflowDependencies
): Promise<PendingWrite> {
  const structuredLog = await dependencies.openAIAdapter.extractDateLog(context.text);

  return dependencies.pendingWriteStore.create({
    userId: context.userId,
    channelId: context.channelId,
    action: 'save_date_log',
    payload: structuredLog
  });
}
