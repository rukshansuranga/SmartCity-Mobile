import { BudgetItemCard } from "@/components/budget/BudgetItemCard";
import { ProgressBar } from "@/components/budget/ProgressBar";
import { BudgetColors } from "@/constants/budgetColors";
import { useBudgetStore } from "@/stores/budgetStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";

export default function CategoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const {
    selectedCategory,
    isLoadingCategory,
    error,
    fetchCategoryDetail,
    clearError,
  } = useBudgetStore();

  useEffect(() => {
    if (id) {
      fetchCategoryDetail(parseInt(id));
    }
  }, [id]);

  const handleRefresh = () => {
    if (id) {
      clearError();
      fetchCategoryDetail(parseInt(id));
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={isLoadingCategory}
            onRefresh={handleRefresh}
            colors={[BudgetColors.primary.green]}
          />
        }
      >
        {error && (
          <View className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
            <Text className="text-red-800">{error}</Text>
          </View>
        )}

        {selectedCategory && (
          <>
            {/* Header Section */}
            <View
              className="px-4 py-6 rounded-b-3xl"
              style={{ backgroundColor: BudgetColors.primary.green }}
            >
              <Text className="text-2xl font-bold text-white mb-2">
                {selectedCategory.name} - Category
              </Text>
              {selectedCategory.description && (
                <Text className="text-white opacity-90 text-sm">
                  {selectedCategory.description}
                </Text>
              )}

              {/* Category Stats */}
              <View className="bg-white rounded-2xl p-4 mt-4 shadow-lg">
                <View className="flex-row justify-between mb-3">
                  <View>
                    <Text className="text-sm text-gray-600">Total Budget</Text>
                    <Text className="text-2xl font-bold text-gray-800">
                      ${selectedCategory.totalAllocation.toLocaleString()}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-sm text-gray-600">Spent</Text>
                    <Text className="text-2xl font-bold text-gray-800">
                      ${selectedCategory.actualSpent.toLocaleString()}
                    </Text>
                  </View>
                </View>

                <ProgressBar
                  current={selectedCategory.actualSpent}
                  total={selectedCategory.totalAllocation}
                  height={12}
                  showPercentage={true}
                />

                <View className="flex-row justify-between mt-3 pt-3 border-t border-gray-200">
                  <View>
                    <Text className="text-xs text-gray-500">Remaining</Text>
                    <Text className="text-lg font-semibold text-gray-800">
                      $
                      {(
                        selectedCategory.totalAllocation -
                        selectedCategory.actualSpent
                      ).toLocaleString()}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-xs text-gray-500">Budget Items</Text>
                    <Text className="text-lg font-semibold text-gray-800">
                      {selectedCategory.budgetItems.length}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Budget Items */}
            <View className="px-4 mt-6 mb-6">
              <View className="flex-row items-center mb-4">
                <MaterialCommunityIcons
                  name="folder-multiple"
                  size={24}
                  color={BudgetColors.primary.green}
                />
                <Text className="text-xl font-bold text-gray-800 ml-2">
                  Budget Items
                </Text>
              </View>

              {selectedCategory.budgetItems.length > 0 ? (
                selectedCategory.budgetItems.map((item) => (
                  <BudgetItemCard
                    key={item.budgetItemId}
                    item={item}
                    categoryId={selectedCategory.categoryId}
                    hasProjects={item.hasProjects}
                  />
                ))
              ) : (
                <View className="items-center py-8">
                  <MaterialCommunityIcons
                    name="folder-open-outline"
                    size={60}
                    color="#CBD5E1"
                  />
                  <Text className="text-gray-400 mt-4">
                    No budget items in this category
                  </Text>
                </View>
              )}
            </View>
          </>
        )}

        {!selectedCategory && !isLoadingCategory && !error && (
          <View className="flex-1 items-center justify-center p-8 mt-20">
            <MaterialCommunityIcons
              name="folder-alert"
              size={80}
              color="#CBD5E1"
            />
            <Text className="text-xl font-semibold text-gray-400 mt-4">
              Category Not Found
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
