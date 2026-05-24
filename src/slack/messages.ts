import type { KnownBlock } from '@slack/bolt';
import type { PendingWrite } from '../domain/pendingWrite.js';
import type { RecommendationResult } from '../domain/recommendation.js';
import type { WorkflowContext } from '../domain/workflow.js';

interface SlackMrkdwnField {
  type: 'mrkdwn';
  text: string;
}

export function buildRecommendationBlocks(result: RecommendationResult, context: WorkflowContext): KnownBlock[] {
  return [
    buildRequestBlock(context),
    { type: 'section', text: { type: 'mrkdwn', text: `*추천 결과*\n${result.summary}` } },
    ...result.items.flatMap((item, index) => buildRecommendationItemBlocks(item, index))
  ];
}

export function buildPendingWritePreviewBlocks(pendingWrite: PendingWrite, context: WorkflowContext): KnownBlock[] {
  const log = pendingWrite.payload;

  return [
    buildRequestBlock(context),
    { type: 'section', text: { type: 'mrkdwn', text: `*저장 미리보기*\n${log.title}` } },
    {
      type: 'section',
      fields: [
        ...buildDateLogSummaryFields(log),
        { type: 'mrkdwn', text: `*누락*\n${log.missingFields.length ? log.missingFields.join(', ') : '없음'}` }
      ]
    },
    {
      type: 'actions',
      elements: [
        { type: 'button', text: { type: 'plain_text', text: '저장' }, style: 'primary', action_id: 'save_pending_write', value: pendingWrite.id },
        { type: 'button', text: { type: 'plain_text', text: '수정' }, action_id: 'edit_pending_write', value: pendingWrite.id },
        { type: 'button', text: { type: 'plain_text', text: '취소' }, style: 'danger', action_id: 'cancel_pending_write', value: pendingWrite.id }
      ]
    }
  ];
}

export function buildSavedDateLogBlocks(pendingWrite: PendingWrite, notionUrl: string): KnownBlock[] {
  const log = pendingWrite.payload;
  const blocks: KnownBlock[] = [];

  if (pendingWrite.request) {
    blocks.push(buildRequestBlock(pendingWrite.request));
  }

  blocks.push(
    { type: 'section', text: { type: 'mrkdwn', text: `*저장 완료*\n<${notionUrl}|Notion 페이지>에 저장했어요.` } },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*제목*\n${log.title}` },
        ...buildDateLogSummaryFields(log)
      ]
    }
  );

  return blocks;
}

export function buildErrorMessage(command: string, requestText: string): string {
  return `요청: ${formatCommandRequest(command, requestText)}\n요청을 처리하지 못했어요. 잠시 뒤 다시 시도해 주세요.`;
}

export function buildProcessingMessage(command: string, requestText: string) {
  return {
    response_type: 'in_channel' as const,
    text: '요청을 처리 중이에요...',
    blocks: [
      buildRequestBlock({ command, text: requestText }),
      {
        type: 'section' as const,
        text: { type: 'mrkdwn' as const, text: '*처리 중*\nAI가 요청을 정리하고 있어요. 잠시만 기다려 주세요.' }
      }
    ]
  };
}

function buildRecommendationItemBlocks(item: RecommendationResult['items'][number], index: number): KnownBlock[] {
  const fields: SlackMrkdwnField[] = [
    { type: 'mrkdwn', text: `*예상 비용*\n${formatCost(item.estimatedCostMin, item.estimatedCostMax)}` },
    { type: 'mrkdwn', text: `*확인할 점*\n${item.needsUserCheck ? '날씨나 예약만 확인' : '바로 진행 가능'}` }
  ];

  if (item.weatherFit) {
    fields.push({ type: 'mrkdwn', text: `*날씨*\n${item.weatherFit}` });
  }
  if (item.noveltyReason) {
    fields.push({ type: 'mrkdwn', text: `*새로움*\n${item.noveltyReason}` });
  }

  return [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${index + 1}. ${item.title}*\n*추천 이유*\n${item.reason}`
      }
    },
    { type: 'section', fields }
  ];
}

function buildRequestBlock(context: Pick<WorkflowContext, 'command' | 'text'>): KnownBlock {
  return {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `*요청*\n\`${formatCommandRequest(context.command, context.text)}\``
    }
  };
}

function formatCommandRequest(command: string, requestText: string): string {
  return `${command} ${requestText || '(빈 요청)'}`.trim();
}

function buildDateLogSummaryFields(log: PendingWrite['payload']): SlackMrkdwnField[] {
  return [
    { type: 'mrkdwn', text: `*날짜*\n${log.date || '확인 필요'}` },
    { type: 'mrkdwn', text: `*장소*\n${log.location ?? '확인 필요'}` },
    { type: 'mrkdwn', text: `*비용*\n${log.cost?.toLocaleString('ko-KR') ?? '확인 필요'}원` }
  ];
}

function formatCost(min?: number, max?: number): string {
  if (min === undefined && max === undefined) {
    return '추정값 없음';
  }
  if (min !== undefined && max !== undefined) {
    return `${min.toLocaleString('ko-KR')}~${max.toLocaleString('ko-KR')}원`;
  }
  return `${(min ?? max)?.toLocaleString('ko-KR')}원`;
}
