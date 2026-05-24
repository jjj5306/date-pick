export interface OpenAIUsage {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  estimatedCostKrw?: number;
  budgetWarning: boolean;
}

export function estimateUsage(totalTokens: number | undefined, monthlyBudgetKrw: number): OpenAIUsage {
  const estimatedCostKrw = totalTokens ? (totalTokens / 1000) * 10 : undefined;

  return {
    totalTokens,
    estimatedCostKrw,
    budgetWarning: estimatedCostKrw !== undefined && estimatedCostKrw > monthlyBudgetKrw * 0.8
  };
}
