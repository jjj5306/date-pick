import { App } from '@slack/bolt';
import type { SlashCommand } from '@slack/bolt';
import type { AppConfig } from '../config/env.js';
import { logger } from '../config/logger.js';
import type { DateRouteDependencies } from './routes.js';
import { handleNoteCommand, handleRecommendCommand } from './routes.js';
import { buildEditPendingWriteMessage, handleCancelPendingWrite, handleSavePendingWrite } from './interactions.js';
import { buildErrorMessage } from './messages.js';

export function createSlackApp(config: AppConfig, dependencies: DateRouteDependencies): App {
  const app = new App({
    token: config.SLACK_BOT_TOKEN,
    appToken: config.SLACK_APP_TOKEN,
    signingSecret: config.SLACK_SIGNING_SECRET,
    socketMode: true
  });

  app.command('/date-recommend', async ({ command, ack, respond }) => {
    await ack();
    try {
      const response = await handleRecommendCommand(buildWorkflowContext(command), dependencies);
      await respond(response);
    } catch (error) {
      logger.error('date recommend command failed', { error });
      await respond(buildErrorMessage(command.command, command.text));
    }
  });

  app.command('/date-note', async ({ command, ack, respond }) => {
    await ack();
    try {
      const response = await handleNoteCommand(buildWorkflowContext(command), dependencies);
      await respond(response);
    } catch (error) {
      logger.error('date note command failed', { error });
      await respond(buildErrorMessage(command.command, command.text));
    }
  });

  app.action('save_pending_write', async ({ ack, body, respond }) => {
    await ack();
    const value = getActionValue(body);
    if (!value) {
      await respond('저장할 대기 항목을 찾지 못했어요.');
      return;
    }
    await respond(await handleSavePendingWrite(value, dependencies));
  });

  app.action('cancel_pending_write', async ({ ack, body, respond }) => {
    await ack();
    const value = getActionValue(body);
    if (!value) {
      await respond('취소할 대기 항목을 찾지 못했어요.');
      return;
    }
    await respond(handleCancelPendingWrite(value, dependencies));
  });

  app.action('edit_pending_write', async ({ ack, respond }) => {
    await ack();
    await respond(buildEditPendingWriteMessage());
  });

  return app;
}

function buildWorkflowContext(command: SlashCommand) {
  return {
    requestId: command.trigger_id,
    userId: command.user_id,
    channelId: command.channel_id,
    text: command.text,
    command: command.command
  };
}

function getActionValue(body: unknown): string | undefined {
  if (!body || typeof body !== 'object' || !('actions' in body) || !Array.isArray(body.actions)) {
    return undefined;
  }

  const action = body.actions[0];
  return action && typeof action === 'object' && 'value' in action && typeof action.value === 'string'
    ? action.value
    : undefined;
}
