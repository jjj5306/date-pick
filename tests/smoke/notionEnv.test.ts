import { Client } from '@notionhq/client';
import { describe, expect, test } from 'vitest';
import { loadConfig } from '../../src/config/env.js';

describe('Notion environment smoke test', () => {
  test('reads configured Notion databases from .env without calling paid APIs', async () => {
    const config = loadConfig();
    const notion = new Client({ auth: config.NOTION_TOKEN });

    await expectDatabaseReadable(notion, 'NOTION_DATE_DATA_SOURCE_ID', config.NOTION_DATE_DATA_SOURCE_ID);
    await expectDatabaseReadable(
      notion,
      'NOTION_ANNIVERSARY_DATA_SOURCE_ID',
      config.NOTION_ANNIVERSARY_DATA_SOURCE_ID
    );
  }, 20_000);
});

async function expectDatabaseReadable(
  notion: Client,
  envName: string,
  databaseId: string
): Promise<void> {
  try {
    const response = await notion.databases.query({ database_id: databaseId, page_size: 1 });
    expect(Array.isArray(response.results)).toBe(true);
  } catch (error) {
    throw new Error(`${envName}=${databaseId} is not readable by the configured Notion integration. Check that the value is a real database ID and that the database is shared with the integration.`, {
      cause: error
    });
  }
}
