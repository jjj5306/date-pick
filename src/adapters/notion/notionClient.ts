import { Client } from '@notionhq/client';
import type { Anniversary } from '../../domain/anniversary.js';
import type { DateItem, StructuredDateLog } from '../../domain/dateItem.js';
import { buildDateLogCreatePayload, mapAnniversaryPage, mapDateItemPage } from './notionMapper.js';
import type { NotionRepository } from './notionRepository.js';
import type { NotionCreatePagePayload, NotionPageLike } from './notionTypes.js';

interface NotionQueryResponse {
  results: unknown[];
}

interface NotionCreateResponse {
  url: string;
}

interface NotionApiClient {
  dataSources: {
    query(input: { data_source_id: string }): Promise<NotionQueryResponse>;
  };
  pages: {
    create(input: NotionCreatePagePayload): Promise<NotionCreateResponse>;
  };
}

export class NotionClientRepository implements NotionRepository {
  private readonly client: NotionApiClient;

  constructor(
    token: string,
    private readonly dateDataSourceId: string,
    private readonly anniversaryDataSourceId: string
  ) {
    this.client = new Client({ auth: token }) as unknown as NotionApiClient;
  }

  async listDateItems(): Promise<DateItem[]> {
    const response = await this.client.dataSources.query({ data_source_id: this.dateDataSourceId });
    return response.results.map((page) => mapDateItemPage(page as NotionPageLike));
  }

  async listAnniversaries(): Promise<Anniversary[]> {
    const response = await this.client.dataSources.query({ data_source_id: this.anniversaryDataSourceId });
    return response.results.map((page) => mapAnniversaryPage(page as NotionPageLike));
  }

  async saveDateLog(log: StructuredDateLog): Promise<{ url: string }> {
    const response = await this.client.pages.create(buildDateLogCreatePayload(this.dateDataSourceId, log));
    return { url: response.url };
  }
}
