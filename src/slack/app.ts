import { App } from '@slack/bolt';
import type { AppConfig } from '../config/env.js';
import { logger } from '../config/logger.js';
import type { DateRouteDependencies } from './routes.js';
import { handleDateCommand } from './routes.js';
import { handleSavePendingWrite } from './interactions.js';

export function createSlackApp(config: AppConfig, dependencies: DateRouteDependencies): App {
  const app = new App({
    token: config.SLACK_BOT_TOKEN,
    appToken: config.SLACK_APP_TOKEN,
    signingSecret: config.SLACK_SIGNING_SECRET,
    socketMode: true
  });

  app.command('/date', async ({ command, ack, respond }) => {
    await ack();
    try {
      const response = await handleDateCommand({
        requestId: command.trigger_id,
        userId: command.user_id,
        channelId: command.channel_id,
        text: command.text
      }, dependencies);
      await respond(response);
    } catch (error) {
      logger.error('date command failed', { error });
      await respond('요청을 처리하지 못했어요. 잠시 뒤 다시 시도해 주세요.');
    }
  });

  app.action('save_pending_write', async ({ ack, body, respond }) => {
    await ack();
    const action = 'actions' in body ? body.actions[0] : undefined;
    const value = action && 'value' in action ? action.value : undefined;
    if (!value) {
      await respond('저장할 대기 항목을 찾지 못했어요.');
      return;
    }
    await respond(await handleSavePendingWrite(value, dependencies));
  });

  return app;
}
