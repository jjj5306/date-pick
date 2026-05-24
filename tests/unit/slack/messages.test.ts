import { describe, expect, test } from 'vitest';
import { buildRecommendationBlocks } from '../../../src/slack/messages.js';

describe('slack messages', () => {
  test('renders recommendation reasons and estimated cost in readable sections', () => {
    const blocks = buildRecommendationBlocks({
      summary: '월요일에는 북카페가 가장 무난해요.',
      items: [{
        title: '북카페',
        reason: '최근 카페 데이트와 겹치지만, 월요일 저녁에 부담 없이 대화하기 좋아요.',
        estimatedCostMin: 20000,
        estimatedCostMax: 40000,
        weatherFit: '비가 와도 괜찮은 실내 일정이에요.',
        noveltyReason: '책과 커피를 같이 고르는 요소가 있어요.',
        confidence: 'high',
        needsUserCheck: false,
        notionSourceUrls: []
      }]
    }, {
      requestId: 'r1',
      userId: 'U1',
      channelId: 'C1',
      command: '/date-recommend',
      text: '이번주 월요일에 뭐할까?'
    });

    const rendered = JSON.stringify(blocks);
    expect(rendered).toContain('추천 이유');
    expect(rendered).toContain('20,000~40,000원');
    expect(rendered).toContain('최근 카페 데이트와 겹치지만');
    expect(rendered).not.toContain('예상 비용: 확인 필요');
  });
});
