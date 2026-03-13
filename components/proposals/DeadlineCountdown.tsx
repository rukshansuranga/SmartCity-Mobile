import { BudgetColors } from "@/constants/budgetColors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, View } from "react-native";

interface DeadlineCountdownProps {
  daysLeft: number;
  deadline: string;
  isOpen: boolean;
}

export function DeadlineCountdown({
  daysLeft,
  deadline,
  isOpen,
}: DeadlineCountdownProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getUrgencyColor = () => {
    if (!isOpen) return "#94A3B8";
    if (daysLeft <= 7) return BudgetColors.primary.orange;
    if (daysLeft <= 14) return BudgetColors.primary.yellow;
    return BudgetColors.primary.green;
  };

  return (
    <View
      className="mx-4 mt-4 rounded-xl p-4 shadow-sm"
      style={{ backgroundColor: getUrgencyColor() + "15" }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <MaterialCommunityIcons
            name={isOpen ? "clock-alert-outline" : "lock"}
            size={32}
            color={getUrgencyColor()}
          />
          <View className="ml-3 flex-1">
            {isOpen ? (
              <>
                <Text
                  className="text-2xl font-bold"
                  style={{ color: getUrgencyColor() }}
                >
                  {daysLeft} Days Left
                </Text>
                <Text className="text-sm text-gray-600">
                  Deadline: {formatDate(deadline)}
                </Text>
              </>
            ) : (
              <>
                <Text
                  className="text-lg font-bold"
                  style={{ color: getUrgencyColor() }}
                >
                  Submissions Closed
                </Text>
                <Text className="text-sm text-gray-600">
                  Ended: {formatDate(deadline)}
                </Text>
              </>
            )}
          </View>
        </View>
      </View>

      {isOpen && daysLeft <= 7 && (
        <View className="mt-3 pt-3 border-t border-gray-200">
          <Text className="text-xs text-gray-700 font-medium">
            ⚡ Hurry! Submit your ideas before the deadline!
          </Text>
        </View>
      )}
    </View>
  );
}
