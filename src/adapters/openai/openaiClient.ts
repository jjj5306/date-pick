import OpenAI from 'openai';
import type { StructuredDateLog } from '../../domain/dateItem.js';
import type { RecommendationResult } from '../../domain/recommendation.js';
import type { RecommendationContext } from '../../engines/recommendation/contextBuilder.js';
import { fillDateFromUserText, formatDateInSeoul } from './openaiDateInference.js';
import { buildDateLogExtractionPrompt, buildRecommendationPrompt } from './openaiPrompts.js';
import { parseRecommendationResponse, parseStructuredDateLog, RetryableOpenAIResponseError } from './openaiSchemas.js';

export interface OpenAIAdapter {
  generateRecommendationResponse(context: RecommendationContext): Promise<RecommendationResult>;
  extractDateLog(text: string): Promise<StructuredDateLog>;
}

interface OpenAIChatResponse {
  choices: Array<{ message: { content: string | null } }>;
}

export interface OpenAIChatApiClient {
  chat: {
    completions: {
      create(input: {
        model: string;
        response_format: { type: 'json_object' };
        messages: Array<{ role: 'user'; content: string }>;
      }): Promise<OpenAIChatResponse>;
    };
  };
}

export class OpenAIClientAdapter implements OpenAIAdapter {
  private readonly client: OpenAIChatApiClient;

  constructor(
    apiKey: string,
    private readonly model: string,
    client?: OpenAIChatApiClient,
    private readonly now: () => Date = () => new Date()
  ) {
    this.client = client ?? (new OpenAI({ apiKey }) as OpenAIChatApiClient);
  }

  async generateRecommendationResponse(context: RecommendationContext): Promise<RecommendationResult> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: buildRecommendationPrompt(context) }]
    });
    const content = response.choices[0]?.message.content ?? '{}';
    return parseRecommendationResponse(parseJsonResponse(content));
  }

  async extractDateLog(text: string): Promise<StructuredDateLog> {
    const referenceDate = formatDateInSeoul(this.now());
    const response = await this.client.chat.completions.create({
      model: this.model,
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: buildDateLogExtractionPrompt(text, referenceDate) }]
    });
    const content = response.choices[0]?.message.content ?? '{}';
    return fillDateFromUserText(parseStructuredDateLog(parseJsonResponse(content)), text, referenceDate);
  }
}

function parseJsonResponse(content: string): unknown {
  try {
    return JSON.parse(content);
  } catch {
    throw new RetryableOpenAIResponseError('OpenAI response was not valid JSON.');
  }
}
