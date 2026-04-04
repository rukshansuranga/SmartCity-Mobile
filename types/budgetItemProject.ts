import { ApiResponse } from "@/types";

export interface BudgetItemProject {
  projectId: number;
  name: string;
  category: string;
  estimation: number;
  totalPaid: number;
}

export type BudgetItemProjectList = BudgetItemProject[];

// API response type for GET /budget/items/{budgetItemId}/projects
export type GetBudgetItemProjectsResponse = ApiResponse<BudgetItemProjectList>;
