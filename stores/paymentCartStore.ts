import { create } from "zustand";

// Unified cart item for unpaid quarters (combines arrears and quarterly)
export interface UnpaidQuarterCartItem {
  assessmentQuarterID: number;
  assessmentID: number;
  taxableUnitID: number;
  landParcelID: number;
  unitReference: string;
  quarter: number;
  year: number;
  dueAmount: number;
  surchargeAmount: number;
  discountAmount: number;
  paymentStatus: string;
}

interface PaymentCartState {
  // Selected unpaid quarter items
  selectedQuarters: UnpaidQuarterCartItem[];

  // Actions for quarters
  addQuarter: (item: UnpaidQuarterCartItem) => void;
  removeQuarter: (assessmentQuarterID: number) => void;
  addMultipleQuarters: (items: UnpaidQuarterCartItem[]) => void;
  removeQuartersForTaxableUnit: (taxableUnitID: number) => void;
  removeQuartersForLandParcel: (landParcelID: number) => void;
  isQuarterSelected: (assessmentQuarterID: number) => boolean;
  isTaxableUnitFullySelected: (
    taxableUnitID: number,
    totalQuarters: UnpaidQuarterCartItem[],
  ) => boolean;

  // Validation for consecutive quarter selection
  canSelectQuarter: (
    taxableUnitID: number,
    year: number,
    quarter: number,
    allQuarters: UnpaidQuarterCartItem[],
  ) => boolean;

  // Calculations
  getTotalDueAmount: () => number;
  getTotalSurcharge: () => number;
  getTotalDiscount: () => number;
  getTotalAmount: () => number;

  // Clear cart
  clearCart: () => void;
}

export const usePaymentCartStore = create<PaymentCartState>((set, get) => ({
  selectedQuarters: [],

  // Quarter actions
  addQuarter: (item) =>
    set((state) => ({
      selectedQuarters: [...state.selectedQuarters, item],
    })),

  removeQuarter: (assessmentQuarterID) =>
    set((state) => ({
      selectedQuarters: state.selectedQuarters.filter(
        (item) => item.assessmentQuarterID !== assessmentQuarterID,
      ),
    })),

  addMultipleQuarters: (items) =>
    set((state) => {
      const existingIds = new Set(
        state.selectedQuarters.map((i) => i.assessmentQuarterID),
      );
      const newItems = items.filter(
        (item) => !existingIds.has(item.assessmentQuarterID),
      );
      return {
        selectedQuarters: [...state.selectedQuarters, ...newItems],
      };
    }),

  removeQuartersForTaxableUnit: (taxableUnitID) =>
    set((state) => ({
      selectedQuarters: state.selectedQuarters.filter(
        (item) => item.taxableUnitID !== taxableUnitID,
      ),
    })),

  removeQuartersForLandParcel: (landParcelID) =>
    set((state) => ({
      selectedQuarters: state.selectedQuarters.filter(
        (item) => item.landParcelID !== landParcelID,
      ),
    })),

  isQuarterSelected: (assessmentQuarterID) => {
    const state = get();
    return state.selectedQuarters.some(
      (item) => item.assessmentQuarterID === assessmentQuarterID,
    );
  },

  isTaxableUnitFullySelected: (taxableUnitID, totalQuarters) => {
    const state = get();
    const selectedForUnit = state.selectedQuarters.filter(
      (item) => item.taxableUnitID === taxableUnitID,
    );
    const totalForUnit = totalQuarters.filter(
      (item) => item.taxableUnitID === taxableUnitID,
    );
    return (
      totalForUnit.length > 0 && selectedForUnit.length === totalForUnit.length
    );
  },

  // Validation for consecutive quarter selection
  // Resident can only select consecutive quarters (e.g., Q3, Q3+Q4, Q3+Q4+Q1)
  // But NOT Q3+Q1 (skipping Q4)
  canSelectQuarter: (taxableUnitID, year, quarter, allQuarters) => {
    const state = get();

    // Get all quarters for this taxable unit, sorted chronologically
    const unitQuarters = allQuarters
      .filter((q) => q.taxableUnitID === taxableUnitID)
      .sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.quarter - b.quarter;
      });

    // Find the index of the quarter we're trying to select
    const targetIndex = unitQuarters.findIndex(
      (q) => q.year === year && q.quarter === quarter,
    );

    if (targetIndex === -1) return false;

    // Get currently selected quarters for this unit
    const selectedForUnit = state.selectedQuarters
      .filter((item) => item.taxableUnitID === taxableUnitID)
      .sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.quarter - b.quarter;
      });

    // If nothing is selected, can only select the first unpaid quarter
    if (selectedForUnit.length === 0) {
      return targetIndex === 0;
    }

    // Find indices of selected quarters
    const selectedIndices = selectedForUnit.map((sq) =>
      unitQuarters.findIndex(
        (q) => q.year === sq.year && q.quarter === sq.quarter,
      ),
    );

    // Check if all currently selected quarters are consecutive
    const minSelected = Math.min(...selectedIndices);
    const maxSelected = Math.max(...selectedIndices);

    // Can select if it's immediately before the min or immediately after the max
    return targetIndex === minSelected - 1 || targetIndex === maxSelected + 1;
  },

  // Calculations
  getTotalDueAmount: () => {
    const state = get();
    return state.selectedQuarters.reduce(
      (sum, item) => sum + (item.dueAmount || 0),
      0,
    );
  },

  getTotalSurcharge: () => {
    const state = get();
    return state.selectedQuarters.reduce(
      (sum, item) => sum + (item.surchargeAmount || 0),
      0,
    );
  },

  getTotalDiscount: () => {
    const state = get();
    return state.selectedQuarters.reduce(
      (sum, item) => sum + (item.discountAmount || 0),
      0,
    );
  },

  getTotalAmount: () => {
    const state = get();
    const dueAmount = state.getTotalDueAmount() || 0;
    const surcharge = state.getTotalSurcharge() || 0;
    const discount = state.getTotalDiscount() || 0;
    return dueAmount + surcharge - discount;
  },

  // Clear actions
  clearCart: () =>
    set(() => ({
      selectedQuarters: [],
    })),
}));
