import { fetchWrapper } from "@/lib/fetchWrapper";
import { ApiResponse } from "@/types";
import {
  ActiveBudgetOverview,
  BudgetStatistics,
  BudgetTransaction,
  CategoryDetail,
  DraftBudgetOverview,
  FiscalYearSummary,
} from "@/types/budget";

/**
 * Get active budget overview for transparency mode
 * Screen A - Active Budget
 */
export async function getActiveBudget(): Promise<
  ApiResponse<ActiveBudgetOverview>
> {
  return fetchWrapper.get(`budget/active`);
}

/**
 * Get draft budget for proposal participation mode
 * Screen B - Proposal Hub
 */
export async function getDraftBudget(): Promise<
  ApiResponse<DraftBudgetOverview>
> {
  return fetchWrapper.get(`budget/draft`);
}

/**
 * Get category details with budget items
 * Category drill-down from Active Budget
 */
export async function getCategoryDetail(
  categoryId: number,
): Promise<ApiResponse<CategoryDetail>> {
  return fetchWrapper.get(`budget/active/categories/${categoryId}`);
}

/**
 * Get budget item transactions for transparency
 */
export async function getBudgetItemTransactions(
  budgetItemId: number,
): Promise<ApiResponse<BudgetTransaction[]>> {
  return fetchWrapper.get(`budget/items/${budgetItemId}/transactions`);
}

/**
 * Get all fiscal years for council (history view)
 */
export async function getFiscalYears(): Promise<
  ApiResponse<FiscalYearSummary[]>
> {
  return fetchWrapper.get(`budget/years`);
}

/**
 * Get budget statistics for dashboard
 */
export async function getBudgetStatistics(): Promise<
  ApiResponse<BudgetStatistics>
> {
  return fetchWrapper.get(`budget/statistics`);
}
