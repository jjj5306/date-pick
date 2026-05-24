import type { NotionRepository } from '../adapters/notion/notionRepository.js';
import type { OpenAIAdapter } from '../adapters/openai/openaiClient.js';
import type { WeatherAdapter } from '../adapters/weather/weatherAdapter.js';
import type { RecommendationResult } from '../domain/recommendation.js';
import type { WorkflowContext } from '../domain/workflow.js';
import { createRecommendationContext } from '../engines/recommendation/recommendationEngine.js';

export interface RecommendationWorkflowDependencies {
  notionRepository: NotionRepository;
  openAIAdapter: OpenAIAdapter;
  weatherAdapter: WeatherAdapter;
}

export async function runRecommendationWorkflow(
  context: WorkflowContext,
  dependencies: RecommendationWorkflowDependencies
): Promise<RecommendationResult> {
  const [dateItems, anniversaries, weather] = await Promise.all([
    dependencies.notionRepository.listDateItems(),
    dependencies.notionRepository.listAnniversaries(),
    dependencies.weatherAdapter.getWeatherHint({ location: context.text })
  ]);

  const recommendationContext = createRecommendationContext({
    userRequest: context.text,
    dateItems,
    anniversaries,
    weather
  });

  if (recommendationContext.candidates.length === 0) {
    return {
      summary: '추천 후보가 부족해요. Notion에 가보고 싶은 곳을 더 추가해 주세요.',
      items: []
    };
  }

  return dependencies.openAIAdapter.generateRecommendationResponse(recommendationContext);
}
