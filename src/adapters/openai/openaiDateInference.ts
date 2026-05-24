import type { StructuredDateLog } from '../../domain/dateItem.js';

export function fillDateFromUserText(
  log: StructuredDateLog,
  userText: string,
  referenceDate: string
): StructuredDateLog {
  if (isIsoDate(log.date)) {
    return log;
  }

  const inferredDate = inferDateFromKoreanText(`${userText} ${log.date}`, referenceDate);
  if (!inferredDate) {
    return log;
  }

  return {
    ...log,
    date: inferredDate,
    missingFields: log.missingFields.filter((field) => field !== 'date')
  };
}

export function inferDateFromKoreanText(userText: string, referenceDate: string): string | undefined {
  const normalized = userText.replace(/\s+/g, '');
  const yearMonthDayMatch = normalized.match(/(\d{4})년(\d{1,2})월(\d{1,2})일/);
  if (yearMonthDayMatch) {
    return formatDateParts(Number(yearMonthDayMatch[1]), Number(yearMonthDayMatch[2]), Number(yearMonthDayMatch[3]));
  }

  const slashDateMatch = normalized.match(/(\d{1,2})\/(\d{1,2})/);
  if (slashDateMatch) {
    return formatDateParts(Number(referenceDate.slice(0, 4)), Number(slashDateMatch[1]), Number(slashDateMatch[2]));
  }

  if (/오늘/.test(normalized)) {
    return addDays(referenceDate, 0);
  }
  if (/어제/.test(normalized)) {
    return addDays(referenceDate, -1);
  }
  if (/(그제|그저께|엊그제)/.test(normalized)) {
    return addDays(referenceDate, -2);
  }
  if (/내일/.test(normalized)) {
    return addDays(referenceDate, 1);
  }

  const monthDayMatch = normalized.match(/(\d{1,2})월(\d{1,2})일/);
  if (monthDayMatch) {
    return formatDateParts(Number(referenceDate.slice(0, 4)), Number(monthDayMatch[1]), Number(monthDayMatch[2]));
  }

  return undefined;
}

export function formatDateInSeoul(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date);

  const year = parts.find((part) => part.type === 'year')?.value ?? '1970';
  const month = parts.find((part) => part.type === 'month')?.value ?? '01';
  const day = parts.find((part) => part.type === 'day')?.value ?? '01';
  return `${year}-${month}-${day}`;
}

function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function addDays(dateText: string, days: number): string {
  const date = new Date(`${dateText}T00:00:00.000+09:00`);
  date.setUTCDate(date.getUTCDate() + days);
  return formatDateInSeoul(date);
}

function formatDateParts(year: number, month: number, day: number): string | undefined {
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return undefined;
  }
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
