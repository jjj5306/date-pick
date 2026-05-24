export type AnniversaryType = 'birthday' | 'anniversary' | 'special_day';

export interface Anniversary {
  id: string;
  title: string;
  type: AnniversaryType;
  date: string;
  notes?: string;
  sourceUrl?: string;
}
