import type { DateItem } from './dateItem.js';

export interface RecommendationCandidate {
  item: DateItem;
  score: number;
  reasons: string[];
  needsUserCheck: boolean;
}

export interface RecommendationResultItem {
  title: string;
  reason: string;
  estimatedCostMin?: number;
  estimatedCostMax?: number;
  weatherFit?: string;
  noveltyReason?: string;
  confidence: 'low' | 'medium' | 'high';
  needsUserCheck: boolean;
  notionSourceUrls: string[];
}

export interface RecommendationResult {
  summary: string;
  items: RecommendationResultItem[];
}
