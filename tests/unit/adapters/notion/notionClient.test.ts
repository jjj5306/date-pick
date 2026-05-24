import { describe, expect, test, vi } from 'vitest';
import { NotionClientRepository, type NotionApiClient } from '../../../../src/adapters/notion/notionClient.js';

const datePage = {
  id: 'date-page-1',
  url: 'https://notion.test/date-page-1',
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

const anniversaryPage = {
  id: 'anniversary-page-1',
  url: 'https://notion.test/anniversary-page-1',
  properties: {
    '이름': { title: [{ plain_text: '1000일' }] },
    '유형': { select: { name: '기념일' } },
    '날짜': { date: { start: '2026-06-01' } },
    'Notes': { rich_text: [{ plain_text: '조용한 식당 선호' }] }
  }
};

describe('NotionClientRepository', () => {
  test('calls Notion database query with the date data source id in listDateItems', async () => {
    const client = createClient({ queryResults: [datePage] });
    const repository = new NotionClientRepository('token', 'date-source', 'anniversary-source', client);

    await expect(repository.listDateItems()).resolves.toMatchObject([{ title: '성수 전시' }]);

    expect(client.databases.query).toHaveBeenCalledTimes(1);
    expect(client.databases.query).toHaveBeenCalledWith({ database_id: 'date-source' });
  });

  test('calls Notion database query with the anniversary data source id in listAnniversaries', async () => {
    const client = createClient({ queryResults: [anniversaryPage] });
    const repository = new NotionClientRepository('token', 'date-source', 'anniversary-source', client);

    await expect(repository.listAnniversaries()).resolves.toMatchObject([{ title: '1000일' }]);

    expect(client.databases.query).toHaveBeenCalledTimes(1);
    expect(client.databases.query).toHaveBeenCalledWith({ database_id: 'anniversary-source' });
  });

  test('calls Notion page create with the approved date log payload in saveDateLog', async () => {
    const client = createClient({ createUrl: 'https://notion.test/saved' });
    const repository = new NotionClientRepository('token', 'date-source', 'anniversary-source', client);

    await expect(repository.saveDateLog({
      title: '성수 데이트',
      date: '2026-05-24',
      category: 'date',
      location: '성수',
      cost: 110000,
      notes: '전시 후 파스타',
      missingFields: [],
      nextRecommendationHints: []
    })).resolves.toEqual({ url: 'https://notion.test/saved' });

    expect(client.pages.create).toHaveBeenCalledTimes(1);
    expect(client.pages.create).toHaveBeenCalledWith(expect.objectContaining({
      parent: { database_id: 'date-source' },
      properties: expect.objectContaining({
        '이름': { title: [{ text: { content: '성수 데이트' } }] },
        '상태': { status: { name: '완료' } },
        '예상 비용': { number: 110000 },
        '언제?': { date: { start: '2026-05-24' } }
      })
    }));
  });
});

function createClient(input: { queryResults?: unknown[]; createUrl?: string }): NotionApiClient {
  return {
    databases: {
      query: vi.fn().mockResolvedValue({ results: input.queryResults ?? [] })
    },
    pages: {
      create: vi.fn().mockResolvedValue({ url: input.createUrl ?? 'https://notion.test/page' })
    }
  };
}
