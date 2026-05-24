import type { KnownBlock } from '@slack/bolt';
import type { WorkflowContext } from '../domain/workflow.js';
import type { PendingWriteCreator } from '../workflows/logWorkflow.js';
import { runLogWorkflow } from '../workflows/logWorkflow.js';
import type { RecommendationWorkflowDependencies } from '../workflows/recommendationWorkflow.js';
import { runRecommendationWorkflow } from '../workflows/recommendationWorkflow.js';
import type { PendingWriteApprovalStore } from '../workflows/saveWorkflow.js';
import { buildPendingWritePreviewBlocks, buildRecommendationBlocks } from './messages.js';

interface PendingWriteStoreGateway extends PendingWriteCreator, PendingWriteApprovalStore {}

export interface DateRouteDependencies extends RecommendationWorkflowDependencies {
  pendingWriteStore: PendingWriteStoreGateway;
}

export async function handleRecommendCommand(
  context: WorkflowContext,
  dependencies: DateRouteDependencies
): Promise<{ text: string; blocks?: KnownBlock[] }> {
  const result = await runRecommendationWorkflow(context, dependencies);
  return { text: result.summary, blocks: buildRecommendationBlocks(result, context) };
}

export async function handleNoteCommand(
  context: WorkflowContext,
  dependencies: DateRouteDependencies
): Promise<{ text: string; blocks?: KnownBlock[] }> {
  const pendingWrite = await runLogWorkflow(context, dependencies);
  return { text: '저장 전 내용을 확인해 주세요.', blocks: buildPendingWritePreviewBlocks(pendingWrite, context) };
}
