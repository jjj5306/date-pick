import type { KnownBlock } from '@slack/bolt';
import { logger } from '../config/logger.js';
import type { SaveWorkflowDependencies } from '../workflows/saveWorkflow.js';
import { runSaveWorkflow } from '../workflows/saveWorkflow.js';
import { buildSavedDateLogBlocks } from './messages.js';

interface SlackActionResponse {
  response_type: 'in_channel';
  replace_original: boolean;
  text: string;
  blocks?: KnownBlock[];
}

export async function handleSavePendingWrite(
  pendingWriteId: string,
  dependencies: SaveWorkflowDependencies
): Promise<string | SlackActionResponse> {
  try {
    const result = await runSaveWorkflow(pendingWriteId, dependencies);
    return {
      response_type: 'in_channel',
      replace_original: true,
      text: `Notion에 저장했어요: ${result.url}`,
      blocks: buildSavedDateLogBlocks(result.pendingWrite, result.url)
    };
  } catch (error) {
    logger.error('save pending write failed', { error });
    if (error instanceof Error && error.message.includes('Pending write')) {
      return '저장할 대기 항목을 찾지 못했어요. `/date-note ...`로 다시 보내 주세요.';
    }
    return 'Notion에 저장하지 못했어요. Notion 데이터베이스가 integration과 공유되어 있는지, `.env`의 `NOTION_DATE_DATA_SOURCE_ID`가 실제 데이터베이스 ID인지 확인한 뒤 저장을 다시 눌러 주세요.';
  }
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
