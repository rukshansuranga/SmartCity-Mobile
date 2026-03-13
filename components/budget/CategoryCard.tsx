import { CategorySummary } from "@/types/budget";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { ProgressBar } from "./ProgressBar";

interface CategoryCardProps {
  category: CategorySummary;
  onPress: () => void;
}

export function CategoryCard({ category, onPress }: CategoryCardProps) {
  const getCategoryIcon = (name: string): any => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("park") || lowerName.includes("space"))
      return "tree";
    if (lowerName.includes("infrastructure") || lowerName.includes("road"))
      return "road-variant";
    if (lowerName.includes("education") || lowerName.includes("school"))
      return "school";
    if (lowerName.includes("waste") || lowerName.includes("garbage"))
      return "delete";
    if (lowerName.includes("health")) return "hospital-box";
    if (lowerName.includes("environment")) return "leaf";
    return "folder";
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
      activeOpacity={0.7}
    >
      <View className="flex-row items-center mb-3">
        <View
          className="w-12 h-12 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: "#2A9D8F" + "20" }}
        >
          <MaterialCommunityIcons
            name={getCategoryIcon(category.name)}
            size={24}
            color="#2A9D8F"
          />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-800">
            {category.name}
          </Text>
          {category.code && (
            <Text className="text-xs text-gray-500">{category.code}</Text>
          )}
        </View>
        <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color="#94A3B8"
        />
      </View>

      {category.description && (
        <Text className="text-sm text-gray-600 mb-3" numberOfLines={2}>
          {category.description}
        </Text>
      )}

      <View className="bg-gray-50 rounded-lg p-3">
        <View className="flex-row justify-between mb-2">
          <Text className="text-sm text-gray-600">Budget</Text>
          <Text className="text-sm font-semibold text-gray-800">
            {category.totalAllocation.toLocaleString()}
          </Text>
        </View>
        <ProgressBar
          current={category.actualSpent}
          total={category.totalAllocation}
          height={10}
          showPercentage={true}
        />
      </View>
    </TouchableOpacity>
  );
}
