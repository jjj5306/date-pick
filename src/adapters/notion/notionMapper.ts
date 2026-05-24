import type { Anniversary, AnniversaryType } from '../../domain/anniversary.js';
import type { DateItem, DateItemCategory, DateItemPriority, DateItemStatus, StructuredDateLog } from '../../domain/dateItem.js';
import { NotionMappingError, type NotionCreatePagePayload, type NotionPageLike, type NotionPageProperties } from './notionTypes.js';

const categoryMap: Record<string, DateItemCategory> = {
  '여행': 'travel',
  '데이트': 'date',
  '맛집': 'restaurant',
  '기념일': 'anniversary',
  '계절': 'seasonal',
  '기타': 'other'
};

const statusMap: Record<string, DateItemStatus> = {
  '시작 전': 'not_started',
  '진행 중': 'in_progress',
  '완료': 'completed'
};

const priorityMap: Record<string, DateItemPriority> = {
  Low: 'low',
  Medium: 'medium',
  High: 'high'
};

const anniversaryTypeMap: Record<string, AnniversaryType> = {
  '생일': 'birthday',
  '기념일': 'anniversary',
  '특별한 날': 'special_day'
};

function requireProperty(properties: NotionPageProperties, name: string): unknown {
  if (!(name in properties)) {
    throw new NotionMappingError(`Missing Notion property: ${name}`);
  }
  return properties[name];
}

function readTitle(value: unknown): string {
  const title = (value as { title?: Array<{ plain_text?: string }> }).title;
  return title?.[0]?.plain_text ?? '';
}

function readRichText(value: unknown): string | undefined {
  const text = (value as { rich_text?: Array<{ plain_text?: string }> }).rich_text;
  return text?.map((item) => item.plain_text ?? '').join('') || undefined;
}

function readSelectName(value: unknown): string | undefined {
  return (value as { select?: { name?: string }; status?: { name?: string } }).select?.name
    ?? (value as { status?: { name?: string } }).status?.name;
}

function readDate(value: unknown): string | undefined {
  return (value as { date?: { start?: string } }).date?.start;
}

function readNumber(value: unknown): number | undefined {
  const number = (value as { number?: number }).number;
  return typeof number === 'number' ? number : undefined;
}

export function mapDateItemPage(page: NotionPageLike): DateItem {
  const properties = page.properties;
  const categoryName = readSelectName(requireProperty(properties, '분류')) ?? '기타';
  const statusName = readSelectName(requireProperty(properties, '상태')) ?? '시작 전';
  const priorityName = readSelectName(requireProperty(properties, '우선순위')) ?? 'Medium';

  return {
    id: page.id,
    title: readTitle(requireProperty(properties, '이름')),
    category: categoryMap[categoryName] ?? 'other',
    status: statusMap[statusName] ?? 'not_started',
    priority: priorityMap[priorityName] ?? 'medium',
    date: readDate(requireProperty(properties, '언제?')),
    estimatedCost: readNumber(requireProperty(properties, '예상 비용')),
    location: readRichText(requireProperty(properties, '어디로?')),
    notes: readRichText(requireProperty(properties, '비고')),
    sourceUrl: page.url
  };
}

export function mapAnniversaryPage(page: NotionPageLike): Anniversary {
  const typeName = readSelectName(requireProperty(page.properties, '유형')) ?? '기념일';

  return {
    id: page.id,
    title: readTitle(requireProperty(page.properties, '이름')),
    type: anniversaryTypeMap[typeName] ?? 'anniversary',
    date: readDate(requireProperty(page.properties, '날짜')) ?? '',
    notes: readRichText(requireProperty(page.properties, 'Notes')),
    sourceUrl: page.url
  };
}

export function buildDateLogCreatePayload(dataSourceId: string, log: StructuredDateLog): NotionCreatePagePayload {
  const properties: NotionPageProperties = {
    '이름': { title: [{ text: { content: log.title } }] },
    '분류': { select: { name: '데이트' } },
    '상태': { status: { name: '완료' } },
    '예상 비용': { number: log.cost ?? null },
    '어디로?': { rich_text: [{ text: { content: log.location ?? '' } }] },
    '비고': { rich_text: [{ text: { content: log.notes ?? '' } }] }
  };

  if (log.date) {
    properties['언제?'] = { date: { start: log.date } };
  }

  return {
    parent: { database_id: dataSourceId },
    properties
  };
}
