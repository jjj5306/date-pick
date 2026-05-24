export interface NotionPageProperties {
  [name: string]: unknown;
}

export interface NotionPageLike {
  id: string;
  url?: string;
  properties: NotionPageProperties;
}

export interface NotionCreatePagePayload {
  parent: { data_source_id: string };
  properties: NotionPageProperties;
}

export class NotionMappingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotionMappingError';
  }
}
