import { loadConfig } from './config/env.js';
import { logger } from './config/logger.js';
import { NotionClientRepository } from './adapters/notion/notionClient.js';
import { OpenAIClientAdapter } from './adapters/openai/openaiClient.js';
import { MockWeatherAdapter } from './adapters/weather/mockWeatherAdapter.js';
import { createSlackApp } from './slack/app.js';
import { PendingWriteStore } from './storage/pendingWriteStore.js';
import { applyMigrations, openSqlite } from './storage/sqlite.js';

async function main(): Promise<void> {
  const config = loadConfig();
  const database = await openSqlite(config.SQLITE_PATH);
  applyMigrations(database);

  const dependencies = {
    notionRepository: new NotionClientRepository(
      config.NOTION_TOKEN,
      config.NOTION_DATE_DATA_SOURCE_ID,
      config.NOTION_ANNIVERSARY_DATA_SOURCE_ID
    ),
    openAIAdapter: new OpenAIClientAdapter(config.OPENAI_API_KEY, config.OPENAI_MODEL),
    weatherAdapter: new MockWeatherAdapter(),
    pendingWriteStore: new PendingWriteStore(database)
  };

  const app = createSlackApp(config, dependencies);
  await app.start();
  logger.info('date-pick Slack app is running in Socket Mode');
}

main().catch((error: unknown) => {
  logger.error('date-pick failed to start', { error });
  process.exitCode = 1;
});
