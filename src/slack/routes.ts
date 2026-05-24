import type { KnownBlock } from '@slack/bolt';
import type { WorkflowContext } from '../domain/workflow.js';
import type { PendingWriteCreator } from '../workflows/logWorkflow.js';
import { runLogWorkflow } from '../workflows/logWorkflow.js';
import type { RecommendationWorkflowDependencies } from '../workflows/recommendationWorkflow.js';
import { runRecommendationWorkflow } from '../workflows/recommendationWorkflow.js';
import type { PendingWriteApprovalStore } from '../workflows/saveWorkflow.js';
import { buildHelpMessage, buildPendingWritePreviewBlocks, buildRecommendationBlocks } from './messages.js';

interface PendingWriteStoreGateway extends PendingWriteCreator, PendingWriteApprovalStore {}

export interface DateRouteDependencies extends RecommendationWorkflowDependencies {
  pendingWriteStore: PendingWriteStoreGateway;
}

export function classifyDateIntent(text: string): 'recommendation' | 'date_log' | 'unknown' {
  const normalized = text.trim().toLowerCase();
  if (!normalized) {
    return 'unknown';
  }
  if (/(추천|뭐하지|어디|코스|데이트\s*픽|recommend)/i.test(normalized)) {
    return 'recommendation';
  }
  if (/(기록|저장|다녀|먹었|봤|방문|log)/i.test(normalized)) {
    return 'date_log';
  }
  return 'unknown';
}

export async function handleDateCommand(
  context: WorkflowContext,
  dependencies: DateRouteDependencies
): Promise<{ text: string; blocks?: KnownBlock[] }> {
  const intent = classifyDateIntent(context.text);

  if (intent === 'recommendation') {
    const result = await runRecommendationWorkflow(context, dependencies);
    return { text: result.summary, blocks: buildRecommendationBlocks(result) };
  }

  if (intent === 'date_log') {
    const pendingWrite = await runLogWorkflow(context, dependencies);
    return { text: '저장 전 내용을 확인해 주세요.', blocks: buildPendingWritePreviewBlocks(pendingWrite) };
  }

  return { text: buildHelpMessage() };
}
