import type { KnownBlock } from '@slack/bolt';
import type { PendingWrite } from '../domain/pendingWrite.js';
import type { RecommendationResult } from '../domain/recommendation.js';

export function buildRecommendationBlocks(result: RecommendationResult): KnownBlock[] {
  const itemBlocks = result.items.flatMap<KnownBlock>((item, index) => [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${index + 1}. ${item.title}*\n${item.reason}\n예상 비용: ${formatCost(item.estimatedCostMin, item.estimatedCostMax)}\n확인 필요: ${item.needsUserCheck ? '있음' : '없음'}`
      }
    }
  ]);

  return [
    { type: 'section', text: { type: 'mrkdwn', text: `*추천 결과*\n${result.summary}` } },
    ...itemBlocks
  ];
}

export function buildPendingWritePreviewBlocks(pendingWrite: PendingWrite): KnownBlock[] {
  const log = pendingWrite.payload;

  return [
    { type: 'section', text: { type: 'mrkdwn', text: `*저장 미리보기*\n${log.title}` } },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*날짜*\n${log.date}` },
        { type: 'mrkdwn', text: `*장소*\n${log.location ?? '확인 필요'}` },
        { type: 'mrkdwn', text: `*비용*\n${log.cost?.toLocaleString('ko-KR') ?? '확인 필요'}원` },
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

export function buildHelpMessage(): string {
  return '`/date 추천` 또는 `/date 기록 오늘 성수에서 전시 보고...`처럼 입력해 주세요.';
}

function formatCost(min?: number, max?: number): string {
  if (min === undefined && max === undefined) {
    return '확인 필요';
  }
  if (min !== undefined && max !== undefined) {
    return `${min.toLocaleString('ko-KR')}~${max.toLocaleString('ko-KR')}원`;
  }
  return `${(min ?? max)?.toLocaleString('ko-KR')}원`;
}
