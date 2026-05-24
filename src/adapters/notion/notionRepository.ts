import type { Anniversary } from '../../domain/anniversary.js';
import type { DateItem, StructuredDateLog } from '../../domain/dateItem.js';

export interface NotionRepository {
  listDateItems(): Promise<DateItem[]>;
  listAnniversaries(): Promise<Anniversary[]>;
  saveDateLog(log: StructuredDateLog): Promise<{ url: string }>;
}
