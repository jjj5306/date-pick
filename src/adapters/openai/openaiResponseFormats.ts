export type OpenAIResponseFormat = {
  type: 'json_schema';
  json_schema: {
    name: string;
    strict: true;
    schema: Record<string, unknown>;
  };
};

const nullableString = { type: ['string', 'null'] };
export const recommendationResponseFormat: OpenAIResponseFormat = {
  type: 'json_schema',
  json_schema: {
    name: 'date_recommendation',
    strict: true,
    schema: {
      type: 'object',
      additionalProperties: false,
      required: ['summary', 'items'],
      properties: {
        summary: { type: 'string' },
        items: {
          type: 'array',
          maxItems: 3,
          items: {
            type: 'object',
            additionalProperties: false,
            required: [
              'title',
              'reason',
              'estimatedCostMin',
              'estimatedCostMax',
              'weatherFit',
              'noveltyReason',
              'confidence',
              'needsUserCheck',
              'notionSourceUrls'
            ],
            properties: {
              title: { type: 'string' },
              reason: { type: 'string' },
              estimatedCostMin: { type: 'number' },
              estimatedCostMax: { type: 'number' },
              weatherFit: nullableString,
              noveltyReason: nullableString,
              confidence: { type: 'string', enum: ['low', 'medium', 'high'] },
              needsUserCheck: { type: 'boolean' },
              notionSourceUrls: { type: 'array', items: { type: 'string' } }
            }
          }
        }
      }
    }
  }
};

export const dateLogResponseFormat: OpenAIResponseFormat = {
  type: 'json_schema',
  json_schema: {
    name: 'date_log',
    strict: true,
    schema: {
      type: 'object',
      additionalProperties: false,
      required: [
        'title',
        'date',
        'category',
        'location',
        'indoorOutdoor',
        'cost',
        'sentiment',
        'notes',
        'nextRecommendationHints',
        'missingFields'
      ],
      properties: {
        title: { type: 'string' },
        date: { type: 'string' },
        category: { type: 'string', enum: ['travel', 'date', 'restaurant', 'anniversary', 'seasonal', 'other'] },
        location: nullableString,
        indoorOutdoor: { type: ['string', 'null'], enum: ['indoor', 'outdoor', 'mixed', 'unknown', null] },
        cost: { type: ['number', 'null'] },
        sentiment: nullableString,
        notes: nullableString,
        nextRecommendationHints: { type: 'array', items: { type: 'string' } },
        missingFields: { type: 'array', items: { type: 'string' } }
      }
    }
  }
};
