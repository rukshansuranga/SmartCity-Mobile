import { BudgetItemSummary } from "@/types/budget";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { ProgressBar } from "./ProgressBar";
import { StatusBadge } from "./StatusBadge";

import { useRouter } from "expo-router";

interface BudgetItemCardProps {
  item: BudgetItemSummary;
  categoryId?: number | string;
  hasProjects?: boolean;
}

export function BudgetItemCard({
  item,
  categoryId,
  hasProjects,
}: BudgetItemCardProps) {
  const router = useRouter();
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  const handlePress = () => {
    if (hasProjects && categoryId) {
      router.push({
        pathname: "/(budget)/category/[categoryId]/item/[itemId]/projects",
        params: {
          categoryId: String(categoryId),
          itemId: String(item.budgetItemId),
        },
      });
    }
  };

  const CardContent = (
    <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-800 mb-1">
            {item.title}
          </Text>
          <StatusBadge status={item.status} size="sm" />
        </View>
      </View>

      {item.description && (
        <Text className="text-sm text-gray-600 mb-3" numberOfLines={3}>
          {item.description}
        </Text>
      )}

      {item.responsibleDepartment && (
        <View className="flex-row items-center mb-2">
          <MaterialCommunityIcons
            name="office-building"
            size={16}
            color="#64748B"
          />
          <Text className="text-xs text-gray-600 ml-1">
            {item.responsibleDepartment}
          </Text>
        </View>
      )}

      {(item.startDate || item.endDate) && (
        <View className="flex-row items-center mb-3">
          <MaterialCommunityIcons
            name="calendar-range"
            size={16}
            color="#64748B"
          />
          <Text className="text-xs text-gray-600 ml-1">
            {formatDate(item.startDate)} - {formatDate(item.endDate)}
          </Text>
        </View>
      )}

      <View className="bg-gray-50 rounded-lg p-3">
        <View className="flex-row justify-between mb-2">
          <Text className="text-sm text-gray-600">Spending</Text>
          <Text className="text-sm font-semibold text-gray-800">
            ${item.actualSpent.toLocaleString()} / $
            {item.plannedAmount.toLocaleString()}
          </Text>
        </View>
        <ProgressBar
          current={item.actualSpent}
          total={item.plannedAmount}
          height={8}
          showPercentage={true}
        />
      </View>

      {/* Projects link/button */}
      {hasProjects ? (
        <View className="mt-3">
          <Text className="text-blue-600 underline">View Projects</Text>
        </View>
      ) : null}
    </View>
  );

  if (hasProjects && categoryId) {
    return (
      <Pressable onPress={handlePress} accessibilityRole="button">
        {CardContent}
      </Pressable>
    );
  }
  return CardContent;
}
