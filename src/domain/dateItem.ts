export type DateItemCategory = 'travel' | 'date' | 'restaurant' | 'anniversary' | 'seasonal' | 'other';
export type DateItemStatus = 'not_started' | 'in_progress' | 'completed';
export type DateItemPriority = 'low' | 'medium' | 'high';

export interface DateItem {
  id: string;
  title: string;
  category: DateItemCategory;
  status: DateItemStatus;
  priority: DateItemPriority;
  date?: string;
  estimatedCost?: number;
  location?: string;
  notes?: string;
  sourceUrl?: string;
}

export interface StructuredDateLog {
  title: string;
  date: string;
  category: DateItemCategory;
  location?: string;
  indoorOutdoor?: 'indoor' | 'outdoor' | 'mixed' | 'unknown';
  cost?: number;
  sentiment?: string;
  notes?: string;
  nextRecommendationHints?: string[];
  missingFields: string[];
}
