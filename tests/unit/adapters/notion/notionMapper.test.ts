import { describe, expect, test } from 'vitest';
import { buildDateLogCreatePayload, mapDateItemPage } from '../../../../src/adapters/notion/notionMapper.js';
import { NotionMappingError } from '../../../../src/adapters/notion/notionTypes.js';

const page = {
  id: 'page-1',
  url: 'https://notion.test/page-1',
  properties: {
    '이름': { title: [{ plain_text: '성수 전시' }] },
    '분류': { select: { name: '데이트' } },
    '상태': { status: { name: '시작 전' } },
    '우선순위': { select: { name: 'High' } },
    '언제?': { date: { start: '2026-05-30' } },
    '예상 비용': { number: 80000 },
    '어디로?': { rich_text: [{ plain_text: '성수' }] },
    '비고': { rich_text: [{ plain_text: '비 오면 실내 위주' }] }
  }
};

describe('notionMapper', () => {
  test('maps Korean Notion properties to English domain fields', () => {
    expect(mapDateItemPage(page)).toMatchObject({
      title: '성수 전시',
      category: 'date',
      status: 'not_started',
      priority: 'high',
      estimatedCost: 80000,
      location: '성수'
    });
  });

  test('throws a clear mapping error when a property is missing', () => {
    const brokenPage: { properties: Partial<typeof page.properties> } & Omit<typeof page, 'properties'> = {
      ...page,
      properties: { ...page.properties }
    };
    delete brokenPage.properties['이름'];
    expect(() => mapDateItemPage(brokenPage)).toThrow(NotionMappingError);
  });

  test('builds a Notion create payload for an approved date log', () => {
    const payload = buildDateLogCreatePayload('date-source', {
      title: '성수 데이트',
      date: '2026-05-24',
      category: 'date',
      location: '성수',
      cost: 110000,
      notes: '전시 후 파스타',
      missingFields: [],
      nextRecommendationHints: []
    });

    expect(payload.parent.database_id).toBe('date-source');
    expect(payload.properties['예상 비용']).toEqual({ number: 110000 });
  });

  test('omits Notion date property when extracted date is missing', () => {
    const payload = buildDateLogCreatePayload('date-source', {
      title: '성수 데이트',
      date: '',
      category: 'date',
      missingFields: ['date']
    });

    expect(payload.properties['언제?']).toBeUndefined();
  });

});
