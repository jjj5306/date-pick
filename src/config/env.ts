import 'dotenv/config';
import { z } from 'zod';

const notionIdSchema = z.string().regex(
  /^(?:[0-9a-fA-F]{32}|[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/,
  'must be a Notion database ID, not a full Notion URL'
);

const envSchema = z.object({
  SLACK_BOT_TOKEN: z.string().min(1),
  SLACK_APP_TOKEN: z.string().min(1),
  SLACK_SIGNING_SECRET: z.string().min(1),
  NOTION_TOKEN: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1),
  NOTION_DATE_DATA_SOURCE_ID: notionIdSchema,
  NOTION_ANNIVERSARY_DATA_SOURCE_ID: notionIdSchema,
  SQLITE_PATH: z.string().min(1),
  OPENAI_MODEL: z.string().min(1)
});

export type AppConfig = z.infer<typeof envSchema>;

export function loadConfig(source: NodeJS.ProcessEnv = process.env): AppConfig {
  const result = envSchema.safeParse(source);

  if (!result.success) {
    const missing = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join(', ');
    throw new Error(`Invalid environment configuration: ${missing}`);
  }

  return result.data;
}
