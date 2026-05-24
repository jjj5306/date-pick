import OpenAI from 'openai';
import type { StructuredDateLog } from '../../domain/dateItem.js';
import type { RecommendationResult } from '../../domain/recommendation.js';
import type { RecommendationContext } from '../../engines/recommendation/contextBuilder.js';
import { buildDateLogExtractionPrompt, buildRecommendationPrompt } from './openaiPrompts.js';
import { parseRecommendationResponse, parseStructuredDateLog } from './openaiSchemas.js';

export interface OpenAIAdapter {
  generateRecommendationResponse(context: RecommendationContext): Promise<RecommendationResult>;
  extractDateLog(text: string): Promise<StructuredDateLog>;
}

export class OpenAIClientAdapter implements OpenAIAdapter {
  private readonly client: OpenAI;

  constructor(
    apiKey: string,
    private readonly model: string
  ) {
    this.client = new OpenAI({ apiKey });
  }

  async generateRecommendationResponse(context: RecommendationContext): Promise<RecommendationResult> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: buildRecommendationPrompt(context) }]
    });
    const content = response.choices[0]?.message.content ?? '{}';
    return parseRecommendationResponse(JSON.parse(content));
  }

  async extractDateLog(text: string): Promise<StructuredDateLog> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: buildDateLogExtractionPrompt(text) }]
    });
    const content = response.choices[0]?.message.content ?? '{}';
    return parseStructuredDateLog(JSON.parse(content));
  }
}
