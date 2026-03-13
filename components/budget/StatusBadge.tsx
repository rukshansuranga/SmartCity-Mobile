import {
  BudgetColors,
  getBudgetItemStatusColor,
  getProposalStatusColor,
} from "@/constants/budgetColors";
import { Text, View } from "react-native";

interface StatusBadgeProps {
  status:
    | "Planned"
    | "InProgress"
    | "Completed"
    | "OnHold"
    | "Submitted"
    | "UnderReview"
    | "Approved"
    | "Rejected"
    | "Funded"
    | "Implemented"
    | "Active"
    | "Draft"
    | "Closed";
  size?: "sm" | "md" | "lg";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const getColor = () => {
    if (
      status === "Planned" ||
      status === "InProgress" ||
      status === "Completed" ||
      status === "OnHold"
    ) {
      return getBudgetItemStatusColor(status);
    }
    if (
      status === "Submitted" ||
      status === "UnderReview" ||
      status === "Approved" ||
      status === "Rejected" ||
      status === "Funded" ||
      status === "Implemented"
    ) {
      return getProposalStatusColor(status);
    }
    // Fiscal year status
    if (status === "Active") return BudgetColors.fiscalYear.active;
    if (status === "Draft") return BudgetColors.fiscalYear.draft;
    if (status === "Closed") return BudgetColors.fiscalYear.closed;
    return BudgetColors.ui.border;
  };

  const getLabel = () => {
    switch (status) {
      case "InProgress":
        return "In Progress";
      case "OnHold":
        return "On Hold";
      case "UnderReview":
        return "Under Review";
      default:
        return status;
    }
  };

  const sizeClasses = {
    sm: "px-2 py-0.5",
    md: "px-3 py-1",
    lg: "px-4 py-1.5",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <View
      className={`rounded-full ${sizeClasses[size]} self-start`}
      style={{ backgroundColor: getColor() + "20" }}
    >
      <Text
        className={`${textSizeClasses[size]} font-semibold`}
        style={{ color: getColor() }}
      >
        {getLabel()}
      </Text>
    </View>
  );
}
