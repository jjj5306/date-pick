import type { NotionRepository } from '../adapters/notion/notionRepository.js';
import type { PendingWrite } from '../domain/pendingWrite.js';

export interface PendingWriteApprovalStore {
  findById(id: string): PendingWrite | undefined;
  deleteById(id: string): void;
}

export interface SaveWorkflowDependencies {
  notionRepository: NotionRepository;
  pendingWriteStore: PendingWriteApprovalStore;
}

export async function runSaveWorkflow(
  pendingWriteId: string,
  dependencies: SaveWorkflowDependencies
): Promise<{ url: string }> {
  const pendingWrite = dependencies.pendingWriteStore.findById(pendingWriteId);
  if (!pendingWrite) {
    throw new Error('Pending write was not found or already expired.');
  }

  const result = await dependencies.notionRepository.saveDateLog(pendingWrite.payload);
  dependencies.pendingWriteStore.deleteById(pendingWrite.id);
  return result;
}
