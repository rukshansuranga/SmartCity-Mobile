/**
 * Budget Management Color Palette
 * Based on project colors: #2A9D8F (green), #E76F51 (orange), #E9C46A (yellow)
 */

export const BudgetColors = {
  // Primary Brand Colors
  primary: {
    green: "#2A9D8F",
    orange: "#E76F51",
    yellow: "#E9C46A",
  },

  // Fiscal Year Status
  fiscalYear: {
    active: "#2A9D8F", // Green - Active budget
    draft: "#E9C46A", // Yellow - Draft/Planning
    closed: "#94A3B8", // Gray - Historical
  },

  // Budget Status (Spending Progress)
  spending: {
    onTrack: "#2A9D8F", // Green - Under 70% spent
    warning: "#E9C46A", // Yellow - 70-100% spent
    overBudget: "#E76F51", // Orange/Red - Over budget
  },

  // Budget Item Status
  itemStatus: {
    planned: "#94A3B8", // Gray - Not started
    inProgress: "#2A9D8F", // Green - Active
    completed: "#22C55E", // Bright green - Done
    onHold: "#E76F51", // Orange - Paused
  },

  // Proposal Status
  proposal: {
    submitted: "#3B82F6", // Blue - Just submitted
    underReview: "#E9C46A", // Yellow - Being reviewed
    approved: "#2A9D8F", // Green - Approved
    rejected: "#E76F51", // Orange - Rejected
    funded: "#22C55E", // Bright green - Got funding!
    implemented: "#06B6D4", // Cyan - Project complete
  },

  // Voting Colors
  vote: {
    upvote: "#2A9D8F", // Green
    downvote: "#E76F51", // Orange
    neutral: "#94A3B8", // Gray - No vote yet
  },

  // Category Colors (for icons/backgrounds)
  categories: {
    publicSpaces: {
      light: "#2A9D8F",
      dark: "#1F7A6E",
    },
    infrastructure: {
      light: "#E76F51",
      dark: "#D85A3C",
    },
    education: {
      light: "#3B82F6",
      dark: "#2563EB",
    },
    wasteManagement: {
      light: "#8B5CF6",
      dark: "#7C3AED",
    },
    health: {
      light: "#EC4899",
      dark: "#DB2777",
    },
    environment: {
      light: "#10B981",
      dark: "#059669",
    },
  },

  // UI Elements
  ui: {
    background: "#F8FAFC",
    surface: "#FFFFFF",
    border: "#E2E8F0",
    divider: "#CBD5E1",
    overlay: "rgba(0, 0, 0, 0.5)",
  },

  // Text Colors
  text: {
    primary: "#1E293B",
    secondary: "#64748B",
    tertiary: "#94A3B8",
    inverse: "#FFFFFF",
    link: "#2A9D8F",
  },

  // Progress Bar Gradients
  progress: {
    low: ["#2A9D8F", "#22C55E"], // 0-50%
    medium: ["#E9C46A", "#F59E0B"], // 50-80%
    high: ["#E76F51", "#DC2626"], // 80-100%
  },
};

/**
 * Get spending status color based on percentage
 */
export function getSpendingColor(percentage: number): string {
  if (percentage >= 100) return BudgetColors.spending.overBudget;
  if (percentage >= 70) return BudgetColors.spending.warning;
  return BudgetColors.spending.onTrack;
}

/**
 * Get proposal status color
 */
export function getProposalStatusColor(
  status:
    | "Submitted"
    | "UnderReview"
    | "Approved"
    | "Rejected"
    | "Funded"
    | "Implemented",
): string {
  switch (status) {
    case "Submitted":
      return BudgetColors.proposal.submitted;
    case "UnderReview":
      return BudgetColors.proposal.underReview;
    case "Approved":
      return BudgetColors.proposal.approved;
    case "Rejected":
      return BudgetColors.proposal.rejected;
    case "Funded":
      return BudgetColors.proposal.funded;
    case "Implemented":
      return BudgetColors.proposal.implemented;
    default:
      return BudgetColors.ui.border;
  }
}

/**
 * Get budget item status color
 */
export function getBudgetItemStatusColor(
  status: "Planned" | "InProgress" | "Completed" | "OnHold",
): string {
  switch (status) {
    case "Planned":
      return BudgetColors.itemStatus.planned;
    case "InProgress":
      return BudgetColors.itemStatus.inProgress;
    case "Completed":
      return BudgetColors.itemStatus.completed;
    case "OnHold":
      return BudgetColors.itemStatus.onHold;
    default:
      return BudgetColors.ui.border;
  }
}
