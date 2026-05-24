import type { RespondFn, SlashCommand } from '@slack/bolt';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { runSlashCommand } from '../../../src/slack/app.js';
import type { DateRouteDependencies } from '../../../src/slack/routes.js';

describe('slack app', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('shows a processing message and replaces it with the command result', async () => {
    const respond = vi.fn().mockResolvedValue({}) as unknown as RespondFn;
    const handler = vi.fn().mockResolvedValue({
      response_type: 'in_channel',
      text: '추천 완료'
    });

    await runSlashCommand(buildCommand('/date-recommend', '이번 주말 추천'), respond, buildDependencies(), handler, 'failed');

    expect(respond).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        response_type: 'in_channel',
        text: '요청을 처리 중이에요...'
      })
    );
    expect(respond).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        response_type: 'in_channel',
        replace_original: true,
        text: '추천 완료'
      })
    );
  });

  test('replaces the processing message with an error when the command fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const respond = vi.fn().mockResolvedValue({}) as unknown as RespondFn;
    const handler = vi.fn().mockRejectedValue(new Error('boom'));

    await runSlashCommand(buildCommand('/date-note', '오늘 성수에서 전시'), respond, buildDependencies(), handler, 'failed');

    expect(respond).toHaveBeenCalledTimes(2);
    expect(respond).toHaveBeenLastCalledWith(
      expect.objectContaining({
        response_type: 'in_channel',
        replace_original: true
      })
    );
  });
});

function buildCommand(command: string, text: string): SlashCommand {
  return {
    command,
    text,
    trigger_id: 'trigger-1',
    user_id: 'U1',
    channel_id: 'C1'
  } as SlashCommand;
}

function buildDependencies(): DateRouteDependencies {
  return {
    notionRepository: {
      listDateItems: vi.fn(),
      listAnniversaries: vi.fn(),
      saveDateLog: vi.fn()
    },
    weatherAdapter: {
      getWeatherHint: vi.fn()
    },
    pendingWriteStore: {
      create: vi.fn(),
      findById: vi.fn(),
      deleteById: vi.fn()
    },
    openAIAdapter: {
      generateRecommendationResponse: vi.fn(),
      extractDateLog: vi.fn()
    }
  };
}
