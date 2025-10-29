import { create } from "zustand";

// Item structure for arrears in cart
export interface ArrearsCartItem {
  arrearsID: number;
  assessmentId: number;
  taxableUnitID: number;
  landParcelID: number;
  unitReference: string;
  dueQuarter: number;
  outstandingBalance: number;
  surchargeAccrued?: number | null;
}

// Item structure for quarterly tax in cart
export interface QuarterlyTaxCartItem {
  taxableUnitID: number;
  landParcelID: number;
  unitReference: string;
  taxYear: number;
  quarter: number;
  quarterName: string;
  quarterlyTaxAmount: number;
  discountAmount?: number;
  amountDue: number;
  isDiscountApplicable: boolean;
}

interface PaymentCartState {
  // Selected arrears items
  selectedArrears: ArrearsCartItem[];

  // Selected quarterly tax items
  selectedQuarterlyTax: QuarterlyTaxCartItem[];

  // Actions for arrears
  addArrears: (item: ArrearsCartItem) => void;
  removeArrears: (arrearsID: number) => void;
  addMultipleArrears: (items: ArrearsCartItem[]) => void;
  removeArrearsForLandParcel: (landParcelID: number) => void;
  isArrearsSelected: (arrearsID: number) => boolean;
  isLandParcelArrearsFullySelected: (
    landParcelID: number,
    totalArrears: ArrearsCartItem[]
  ) => boolean;

  // Actions for quarterly tax
  addQuarterlyTax: (item: QuarterlyTaxCartItem) => void;
  removeQuarterlyTax: (
    taxableUnitID: number,
    taxYear: number,
    quarter: number
  ) => void;
  addMultipleQuarterlyTax: (items: QuarterlyTaxCartItem[]) => void;
  removeQuarterlyTaxForLandParcel: (landParcelID: number) => void;
  isQuarterlyTaxSelected: (
    taxableUnitID: number,
    taxYear: number,
    quarter: number
  ) => boolean;
  isLandParcelQuarterlyTaxFullySelected: (
    landParcelID: number,
    totalQuarterly: QuarterlyTaxCartItem[]
  ) => boolean;

  // Validation for quarterly tax ordering
  canSelectQuarter: (
    taxableUnitID: number,
    taxYear: number,
    quarter: number
  ) => boolean;

  // Calculations
  getTotalArrearsAmount: () => number;
  getTotalArrearsSurcharge: () => number;
  getTotalQuarterlyTaxAmount: () => number;
  getTotalQuarterlyDiscount: () => number;
  getTotalAmount: () => number;

  // Clear cart
  clearCart: () => void;
  clearArrears: () => void;
  clearQuarterlyTax: () => void;
}

export const usePaymentCartStore = create<PaymentCartState>((set, get) => ({
  selectedArrears: [],
  selectedQuarterlyTax: [],

  // Arrears actions
  addArrears: (item) =>
    set((state) => ({
      selectedArrears: [...state.selectedArrears, item],
    })),

  removeArrears: (arrearsID) =>
    set((state) => ({
      selectedArrears: state.selectedArrears.filter(
        (item) => item.arrearsID !== arrearsID
      ),
    })),

  addMultipleArrears: (items) =>
    set((state) => {
      const existingIds = new Set(
        state.selectedArrears.map((i) => i.arrearsID)
      );
      const newItems = items.filter((item) => !existingIds.has(item.arrearsID));
      return {
        selectedArrears: [...state.selectedArrears, ...newItems],
      };
    }),

  removeArrearsForLandParcel: (landParcelID) =>
    set((state) => ({
      selectedArrears: state.selectedArrears.filter(
        (item) => item.landParcelID !== landParcelID
      ),
    })),

  isArrearsSelected: (arrearsID) => {
    const state = get();
    return state.selectedArrears.some((item) => item.arrearsID === arrearsID);
  },

  isLandParcelArrearsFullySelected: (landParcelID, totalArrears) => {
    const state = get();
    const selectedForParcel = state.selectedArrears.filter(
      (item) => item.landParcelID === landParcelID
    );
    const totalForParcel = totalArrears.filter(
      (item) => item.landParcelID === landParcelID
    );
    return (
      totalForParcel.length > 0 &&
      selectedForParcel.length === totalForParcel.length
    );
  },

  // Quarterly tax actions
  addQuarterlyTax: (item) =>
    set((state) => ({
      selectedQuarterlyTax: [...state.selectedQuarterlyTax, item],
    })),

  removeQuarterlyTax: (taxableUnitID, taxYear, quarter) =>
    set((state) => ({
      selectedQuarterlyTax: state.selectedQuarterlyTax.filter(
        (item) =>
          !(
            item.taxableUnitID === taxableUnitID &&
            item.taxYear === taxYear &&
            item.quarter === quarter
          )
      ),
    })),

  addMultipleQuarterlyTax: (items) =>
    set((state) => {
      const existingKeys = new Set(
        state.selectedQuarterlyTax.map(
          (i) => `${i.taxableUnitID}-${i.taxYear}-${i.quarter}`
        )
      );
      const newItems = items.filter(
        (item) =>
          !existingKeys.has(
            `${item.taxableUnitID}-${item.taxYear}-${item.quarter}`
          )
      );
      return {
        selectedQuarterlyTax: [...state.selectedQuarterlyTax, ...newItems],
      };
    }),

  removeQuarterlyTaxForLandParcel: (landParcelID) =>
    set((state) => ({
      selectedQuarterlyTax: state.selectedQuarterlyTax.filter(
        (item) => item.landParcelID !== landParcelID
      ),
    })),

  isQuarterlyTaxSelected: (taxableUnitID, taxYear, quarter) => {
    const state = get();
    return state.selectedQuarterlyTax.some(
      (item) =>
        item.taxableUnitID === taxableUnitID &&
        item.taxYear === taxYear &&
        item.quarter === quarter
    );
  },

  isLandParcelQuarterlyTaxFullySelected: (landParcelID, totalQuarterly) => {
    const state = get();
    const selectedForParcel = state.selectedQuarterlyTax.filter(
      (item) => item.landParcelID === landParcelID
    );
    const totalForParcel = totalQuarterly.filter(
      (item) => item.landParcelID === landParcelID
    );
    return (
      totalForParcel.length > 0 &&
      selectedForParcel.length === totalForParcel.length
    );
  },

  // Validation for quarterly tax ordering (Q1 → Q2 → Q3 → Q4)
  canSelectQuarter: (taxableUnitID, taxYear, quarter) => {
    const state = get();

    // Determine the current quarter based on current date
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-11
    const currentYear = now.getFullYear();

    // Map month to quarter: Jan-Mar=1, Apr-Jun=2, Jul-Sep=3, Oct-Dec=4
    const currentQuarter = Math.floor(currentMonth / 3) + 1;

    // If this is for a past year, it's arrears - can always select
    if (taxYear < currentYear) return true;

    // If this is a future year, apply strict ordering from Q1
    if (taxYear > currentYear) {
      if (quarter === 1) return true;
      for (let q = 1; q < quarter; q++) {
        const isSelected = state.selectedQuarterlyTax.some(
          (item) =>
            item.taxableUnitID === taxableUnitID &&
            item.taxYear === taxYear &&
            item.quarter === q
        );
        if (!isSelected) return false;
      }
      return true;
    }

    // For current year:
    // - Current quarter and earlier: can select (these are arrears or current)
    // - Future quarters: only if it's the next consecutive quarter
    if (quarter <= currentQuarter) {
      return true; // Can select current or past quarters (arrears)
    }

    // For quarters after current quarter, apply ordering rule
    // Example: if we're in Q3, can select Q4 only if Q3 is selected
    // Cannot select Q4 if we try to skip Q3
    if (quarter === currentQuarter + 1) {
      // Check if current quarter is selected
      return state.selectedQuarterlyTax.some(
        (item) =>
          item.taxableUnitID === taxableUnitID &&
          item.taxYear === taxYear &&
          item.quarter === currentQuarter
      );
    }

    // Cannot select quarters more than 1 ahead of current quarter
    return false;
  },

  // Calculations
  getTotalArrearsAmount: () => {
    const state = get();
    return state.selectedArrears.reduce(
      (sum, item) => sum + item.outstandingBalance,
      0
    );
  },

  getTotalArrearsSurcharge: () => {
    const state = get();
    return state.selectedArrears.reduce(
      (sum, item) => sum + (item.surchargeAccrued || 0),
      0
    );
  },

  getTotalQuarterlyTaxAmount: () => {
    const state = get();
    return state.selectedQuarterlyTax.reduce(
      (sum, item) => sum + item.amountDue,
      0
    );
  },

  getTotalQuarterlyDiscount: () => {
    const state = get();
    return state.selectedQuarterlyTax.reduce(
      (sum, item) => sum + (item.discountAmount || 0),
      0
    );
  },

  getTotalAmount: () => {
    const state = get();
    const arrearsTotal = state.getTotalArrearsAmount();
    const arrearsSurcharge = state.getTotalArrearsSurcharge();
    const quarterlyTotal = state.getTotalQuarterlyTaxAmount();
    return arrearsTotal + arrearsSurcharge + quarterlyTotal;
  },

  // Clear actions
  clearCart: () =>
    set(() => ({
      selectedArrears: [],
      selectedQuarterlyTax: [],
    })),

  clearArrears: () =>
    set((state) => ({
      selectedArrears: [],
    })),

  clearQuarterlyTax: () =>
    set((state) => ({
      selectedQuarterlyTax: [],
    })),
}));
