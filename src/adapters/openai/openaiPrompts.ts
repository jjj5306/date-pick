import type { RecommendationContext } from '../../engines/recommendation/contextBuilder.js';

export function buildRecommendationPrompt(context: RecommendationContext): string {
  const candidates = context.candidates.map((candidate, index) => ({
    rank: index + 1,
    title: candidate.title,
    category: candidate.category,
    location: candidate.location,
    estimatedCost: candidate.estimatedCost,
    sourceUrl: candidate.sourceUrl,
    reasons: candidate.reasons,
    needsUserCheck: candidate.needsUserCheck
  }));

  return JSON.stringify({
    task: 'Create up to three concise Korean date recommendations for Slack. Return JSON only.',
    schema: {
      summary: 'string, short Korean summary',
      items: [{
        title: 'string',
        reason: 'string',
        estimatedCostMin: 'optional number in KRW',
        estimatedCostMax: 'optional number in KRW',
        weatherFit: 'optional string',
        noveltyReason: 'optional string',
        confidence: 'one of low, medium, high',
        needsUserCheck: 'boolean',
        notionSourceUrls: 'string[] from candidate sourceUrl values only'
      }]
    },
    constraints: [
      'Use exactly the top-level keys summary and items.',
      'Return at most three items.',
      'Every item must include title, reason, confidence, needsUserCheck, and notionSourceUrls.',
      'If a candidate has sourceUrl, include it in notionSourceUrls. Otherwise use an empty array.'
    ],
    userRequest: context.userRequest,
    weather: context.weather,
    anniversaries: context.anniversaries,
    candidates
  });
}

export function buildDateLogExtractionPrompt(text: string, referenceDate: string): string {
  return JSON.stringify({
    task: 'Extract a structured Korean date log. Return JSON only.',
    userText: text,
    referenceDate,
    timezone: 'Asia/Seoul',
    dateRules: [
      'Resolve relative Korean dates against referenceDate.',
      '오늘 means referenceDate.',
      '어제 means one day before referenceDate.',
      '그제, 그저께, 엊그제 mean two days before referenceDate.',
      '내일 means one day after referenceDate only if the user is clearly recording a planned date.',
      'If the user gives M월 D일 without a year, use the year from referenceDate.',
      'Use YYYY-MM-DD format.'
    ],
    schema: {
      title: 'string, short Korean title. Use a sensible fallback if unclear.',
      date: 'string in YYYY-MM-DD format. Infer relative dates when possible. Use an empty string only when no date clue exists.',
      category: 'one of travel, date, restaurant, anniversary, seasonal, other',
      location: 'optional string',
      indoorOutdoor: 'optional one of indoor, outdoor, mixed, unknown',
      cost: 'optional number in KRW',
      sentiment: 'optional string',
      notes: 'optional string',
      nextRecommendationHints: 'string[]',
      missingFields: 'string[] for unknown required fields such as date or location'
    }
  });
}
