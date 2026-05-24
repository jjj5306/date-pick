import type { SaveWorkflowDependencies } from '../workflows/saveWorkflow.js';
import { runSaveWorkflow } from '../workflows/saveWorkflow.js';

export async function handleSavePendingWrite(
  pendingWriteId: string,
  dependencies: SaveWorkflowDependencies
): Promise<string> {
  const result = await runSaveWorkflow(pendingWriteId, dependencies);
  return `Notion에 저장했어요: ${result.url}`;
}

export function handleCancelPendingWrite(
  pendingWriteId: string,
  dependencies: Pick<SaveWorkflowDependencies, 'pendingWriteStore'>
): string {
  dependencies.pendingWriteStore.deleteById(pendingWriteId);
  return '저장을 취소했어요.';
}

export function buildEditPendingWriteMessage(): string {
  return '수정은 아직 MVP에서 지원하지 않아요. 내용을 다시 `/date-note ...`로 보내 주세요.';
}
