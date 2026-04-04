/**
 * Budget Management Types
 * Based on the Resident Budget Management Mobile Application design
 */

export type BudgetItemStatus =
  | "Planned"
  | "InProgress"
  | "Completed"
  | "OnHold";
export type FiscalYearStatus = "Draft" | "Active" | "Closed";

// Active Budget Overview (Screen A)
export interface ActiveBudgetOverview {
  yearLabel: string;
  startDate: string; // DateOnly from backend
  endDate: string; // DateOnly from backend
  totalBudget: number;
  totalSpent: number;
  categories: CategorySummary[];
  recentTransactions: BudgetTransaction[];
}

export interface CategorySummary {
  categoryId: number;
  name: string;
  description?: string;
  code?: string;
  totalAllocation: number;
  actualSpent: number;
  spendingPercentage: number; // Calculated: (actualSpent / totalAllocation) * 100
}

export interface BudgetTransaction {
  transactionId: number;
  budgetItemId: number;
  amount: number;
  vendor?: string;
  description?: string;
  transactionDate: string;
  invoiceNumber?: string;
  createdAt: string;
}

// Draft Budget Overview (Screen B - Proposal Hub)
export interface DraftBudgetOverview {
  yearLabel: string;
  proposalDeadline?: string; // DateOnly
  daysLeftToSubmit?: number;
  isSubmissionOpen: boolean;
  categories: CategorySummaryDto[];
}

export interface CategorySummaryDto {
  categoryId: number;
  name: string;
  description?: string;
  code?: string;
  totalAllocation: number;
}

// Category Detail (Drill-down from Active Budget)
export interface CategoryDetail {
  categoryId: number;
  name: string;
  description?: string;
  totalAllocation: number;
  actualSpent: number;
  spendingPercentage: number;
  budgetItems: BudgetItemSummary[];
}

export interface BudgetItemSummary {
  budgetItemId: number;
  title: string;
  description?: string;
  plannedAmount: number;
  actualSpent: number;
  status: BudgetItemStatus;
  startDate?: string;
  endDate?: string;
  responsibleDepartment?: string;
  spendingProgress: number; // Calculated: (actualSpent / plannedAmount) * 100
  hasProjects?: boolean; // Optional, added for UI logic
}

// Fiscal Year Summary (History View)
export interface FiscalYearSummary {
  councilFiscalYearId: number;
  yearLabel: string;
  startDate: string;
  endDate: string;
  status: FiscalYearStatus;
  proposalSubmissionDeadline?: string;
}

// Budget Statistics
export interface BudgetStatistics {
  totalBudget: number;
  totalSpent: number;
  totalCategories: number;
  totalBudgetItems: number;
  spendingPercentage: number;
  topCategories: CategorySummary[];
}
