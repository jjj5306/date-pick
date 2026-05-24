import { describe, expect, test } from 'vitest';
import { loadConfig } from '../../../src/config/env.js';

const validEnv = {
  SLACK_BOT_TOKEN: 'slack-bot-token',
  SLACK_APP_TOKEN: 'slack-app-token',
  SLACK_SIGNING_SECRET: 'secret',
  NOTION_TOKEN: 'notion',
  OPENAI_API_KEY: 'openai',
  NOTION_DATE_DATA_SOURCE_ID: '2f32d61b14f081c1b1f9fad179140cde',
  NOTION_ANNIVERSARY_DATA_SOURCE_ID: '2f32d61b-14f0-81f1-adfc-000bc302a846',
  SQLITE_PATH: ':memory:',
  OPENAI_MODEL: 'gpt-test'
};

describe('loadConfig', () => {
  test('loads required environment values', () => {
    expect(loadConfig(validEnv).OPENAI_MODEL).toBe('gpt-test');
  });

  test('throws when a required value is missing', () => {
    const missingOpenAIKey: Partial<typeof validEnv> = { ...validEnv };
    delete missingOpenAIKey.OPENAI_API_KEY;
    expect(() => loadConfig(missingOpenAIKey)).toThrow(/OPENAI_API_KEY/);
  });

  test('throws when Notion database id contains a copied page URL query', () => {
    expect(() => loadConfig({
      ...validEnv,
      NOTION_DATE_DATA_SOURCE_ID: '2f32d61b14f081c1b1f9fad179140cde?v=2f32d61b14f0812ba905000c875849ba'
    })).toThrow(/NOTION_DATE_DATA_SOURCE_ID/);
  });
});
