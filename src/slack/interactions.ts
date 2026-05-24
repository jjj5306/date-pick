import type { SaveWorkflowDependencies } from '../workflows/saveWorkflow.js';
import { runSaveWorkflow } from '../workflows/saveWorkflow.js';

export async function handleSavePendingWrite(
  pendingWriteId: string,
  dependencies: SaveWorkflowDependencies
): Promise<string> {
  const result = await runSaveWorkflow(pendingWriteId, dependencies);
  return `Notion에 저장했어요: ${result.url}`;
}
