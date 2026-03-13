import {
  getActiveBudget,
  getBudgetItemTransactions,
  getBudgetStatistics,
  getCategoryDetail,
  getFiscalYears,
} from "@/api/budgetAction";
import {
  ActiveBudgetOverview,
  BudgetStatistics,
  BudgetTransaction,
  CategoryDetail,
  FiscalYearSummary,
} from "@/types/budget";
import { create } from "zustand";

interface BudgetState {
  // Data
  activeBudget: ActiveBudgetOverview | null;
  selectedCategory: CategoryDetail | null;
  transactions: BudgetTransaction[];
  fiscalYears: FiscalYearSummary[];
  statistics: BudgetStatistics | null;

  // Loading states
  isLoadingActiveBudget: boolean;
  isLoadingCategory: boolean;
  isLoadingTransactions: boolean;
  isLoadingStatistics: boolean;

  // Error states
  error: string | null;

  // Actions
  fetchActiveBudget: () => Promise<void>;
  fetchCategoryDetail: (categoryId: number) => Promise<void>;
  fetchBudgetItemTransactions: (budgetItemId: number) => Promise<void>;
  fetchFiscalYears: () => Promise<void>;
  fetchStatistics: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export const useBudgetStore = create<BudgetState>((set, get) => ({
  // Initial state
  activeBudget: null,
  selectedCategory: null,
  transactions: [],
  fiscalYears: [],
  statistics: null,

  isLoadingActiveBudget: false,
  isLoadingCategory: false,
  isLoadingTransactions: false,
  isLoadingStatistics: false,

  error: null,

  // Fetch active budget overview
  fetchActiveBudget: async () => {
    set({ isLoadingActiveBudget: true, error: null });
    try {
      const response = await getActiveBudget();
      if (response.isSuccess) {
        set({ activeBudget: response.data, isLoadingActiveBudget: false });
      } else {
        set({ error: response.message, isLoadingActiveBudget: false });
      }
    } catch (error: any) {
      set({
        error: error.message || "Failed to load active budget",
        isLoadingActiveBudget: false,
      });
    }
  },

  // Fetch category detail with budget items
  fetchCategoryDetail: async (categoryId: number) => {
    set({ isLoadingCategory: true, error: null });
    try {
      const response = await getCategoryDetail(categoryId);
      if (response.isSuccess) {
        set({ selectedCategory: response.data, isLoadingCategory: false });
      } else {
        set({ error: response.message, isLoadingCategory: false });
      }
    } catch (error: any) {
      set({
        error: error.message || "Failed to load category details",
        isLoadingCategory: false,
      });
    }
  },

  // Fetch budget item transactions
  fetchBudgetItemTransactions: async (budgetItemId: number) => {
    set({ isLoadingTransactions: true, error: null });
    try {
      const response = await getBudgetItemTransactions(budgetItemId);
      if (response.isSuccess) {
        set({ transactions: response.data, isLoadingTransactions: false });
      } else {
        set({ error: response.message, isLoadingTransactions: false });
      }
    } catch (error: any) {
      set({
        error: error.message || "Failed to load transactions",
        isLoadingTransactions: false,
      });
    }
  },

  // Fetch fiscal years
  fetchFiscalYears: async () => {
    try {
      const response = await getFiscalYears();
      if (response.isSuccess) {
        set({ fiscalYears: response.data });
      } else {
        set({ error: response.message });
      }
    } catch (error: any) {
      set({ error: error.message || "Failed to load fiscal years" });
    }
  },

  // Fetch budget statistics
  fetchStatistics: async () => {
    set({ isLoadingStatistics: true, error: null });
    try {
      const response = await getBudgetStatistics();
      if (response.isSuccess) {
        set({ statistics: response.data, isLoadingStatistics: false });
      } else {
        set({ error: response.message, isLoadingStatistics: false });
      }
    } catch (error: any) {
      set({
        error: error.message || "Failed to load statistics",
        isLoadingStatistics: false,
      });
    }
  },

  clearError: () => set({ error: null }),

  reset: () =>
    set({
      activeBudget: null,
      selectedCategory: null,
      transactions: [],
      fiscalYears: [],
      statistics: null,
      error: null,
    }),
}));
