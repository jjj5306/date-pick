import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  SLACK_BOT_TOKEN: z.string().min(1),
  SLACK_APP_TOKEN: z.string().min(1),
  SLACK_SIGNING_SECRET: z.string().min(1),
  NOTION_TOKEN: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1),
  NOTION_DATE_DATA_SOURCE_ID: z.string().min(1),
  NOTION_ANNIVERSARY_DATA_SOURCE_ID: z.string().min(1),
  SQLITE_PATH: z.string().min(1),
  OPENAI_MODEL: z.string().min(1)
});

export type AppConfig = z.infer<typeof envSchema>;

export function loadConfig(source: NodeJS.ProcessEnv = process.env): AppConfig {
  const result = envSchema.safeParse(source);

  if (!result.success) {
    const missing = result.error.issues.map((issue) => issue.path.join('.')).join(', ');
    throw new Error(`Invalid environment configuration: ${missing}`);
  }

  return result.data;
}
