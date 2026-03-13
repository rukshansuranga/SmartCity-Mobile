import { getSpendingColor } from "@/constants/budgetColors";
import { Text, View } from "react-native";

interface ProgressBarProps {
  current: number;
  total: number;
  height?: number;
  showPercentage?: boolean;
  showAmounts?: boolean;
}

export function ProgressBar({
  current,
  total,
  height = 8,
  showPercentage = true,
  showAmounts = false,
}: ProgressBarProps) {
  const percentage = total > 0 ? Math.min((current / total) * 100, 100) : 0;
  const color = getSpendingColor(percentage);

  return (
    <View className="w-full">
      <View
        className="w-full bg-gray-200 rounded-full overflow-hidden"
        style={{ height }}
      >
        <View
          className="h-full rounded-full"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </View>
      {(showPercentage || showAmounts) && (
        <View className="flex-row justify-between mt-1">
          {showAmounts && (
            <Text className="text-xs text-gray-600">
              ${current.toLocaleString()} / ${total.toLocaleString()}
            </Text>
          )}
          {showPercentage && (
            <Text className="text-xs font-semibold" style={{ color }}>
              {percentage.toFixed(1)}%
            </Text>
          )}
        </View>
      )}
    </View>
  );
}
