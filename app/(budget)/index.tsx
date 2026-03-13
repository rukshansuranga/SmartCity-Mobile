import { CategoryCard } from "@/components/budget/CategoryCard";
import { StatusBadge } from "@/components/budget/StatusBadge";
import { TransactionItem } from "@/components/budget/TransactionItem";
import { BudgetColors } from "@/constants/budgetColors";
import { useBudgetStore } from "@/stores/budgetStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ActiveBudgetScreen() {
  const router = useRouter();
  const {
    activeBudget,
    isLoadingActiveBudget,
    error,
    fetchActiveBudget,
    clearError,
  } = useBudgetStore();

  useEffect(() => {
    fetchActiveBudget();
  }, []);

  const handleRefresh = () => {
    clearError();
    fetchActiveBudget();
  };

  const totalSpentPercentage =
    activeBudget && activeBudget.totalBudget > 0
      ? (activeBudget.totalSpent / activeBudget.totalBudget) * 100
      : 0;

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={isLoadingActiveBudget}
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

        {activeBudget && (
          <>
            {/* Header Section */}
            <View
              className="px-4 py-6 rounded-b-3xl"
              style={{ backgroundColor: BudgetColors.primary.green }}
            >
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-2xl font-bold text-white">
                  Budget {activeBudget.yearLabel}
                </Text>
                <StatusBadge status="Active" size="md" />
              </View>
              <Text className="text-white opacity-90 text-sm mb-4">
                {new Date(activeBudget.startDate).toLocaleDateString()} -{" "}
                {new Date(activeBudget.endDate).toLocaleDateString()}
              </Text>

              {/* Budget Summary Card */}
              <View className="bg-white rounded-2xl p-4 shadow-lg">
                <View className="flex-row justify-between items-center mb-3">
                  <View>
                    <Text className="text-sm text-gray-600 mb-1">
                      Total Budget
                    </Text>
                    <Text className="text-2xl font-bold text-gray-800">
                      {activeBudget.totalBudget.toLocaleString()}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-sm text-gray-600 mb-1">Spent</Text>
                    <Text className="text-2xl font-bold text-gray-800">
                      {activeBudget.totalSpent.toLocaleString()}
                    </Text>
                  </View>
                </View>

                {/* Progress Bar */}
                <View className="bg-gray-200 rounded-full h-3 overflow-hidden">
                  <View
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(totalSpentPercentage, 100)}%`,
                      backgroundColor:
                        totalSpentPercentage >= 100
                          ? BudgetColors.spending.overBudget
                          : totalSpentPercentage >= 70
                            ? BudgetColors.spending.warning
                            : BudgetColors.spending.onTrack,
                    }}
                  />
                </View>
                <Text className="text-right text-sm text-gray-600 mt-1">
                  {totalSpentPercentage.toFixed(1)}% spent
                </Text>

                <View className="flex-row justify-between mt-3 pt-3 border-t border-gray-200">
                  <View>
                    <Text className="text-xs text-gray-500">Remaining</Text>
                    <Text className="text-lg font-semibold text-gray-800">
                      {(
                        activeBudget.totalBudget - activeBudget.totalSpent
                      ).toLocaleString()}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => router.push("/(budget)/proposals")}
                    className="flex-row items-center bg-yellow-50 px-4 py-2 rounded-full"
                  >
                    <MaterialCommunityIcons
                      name="lightbulb"
                      size={20}
                      color={BudgetColors.primary.yellow}
                    />
                    <Text
                      className="ml-2 font-semibold"
                      style={{ color: BudgetColors.primary.yellow }}
                    >
                      Share Ideas
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Categories Section */}
            <View className="px-4 mt-6">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-xl font-bold text-gray-800">
                  Budget Breakdown
                </Text>
                <MaterialCommunityIcons
                  name="chart-donut"
                  size={24}
                  color={BudgetColors.primary.green}
                />
              </View>

              {activeBudget.categories.map((category) => (
                <CategoryCard
                  key={category.categoryId}
                  category={category}
                  onPress={() =>
                    router.push(`/(budget)/category/${category.categoryId}`)
                  }
                />
              ))}
            </View>

            {/* Recent Transactions */}
            {activeBudget.recentTransactions &&
              activeBudget.recentTransactions.length > 0 && (
                <View className="px-4 mt-6 mb-6">
                  <View className="flex-row items-center mb-4">
                    <MaterialCommunityIcons
                      name="receipt"
                      size={24}
                      color={BudgetColors.primary.green}
                    />
                    <Text className="text-xl font-bold text-gray-800 ml-2">
                      Recent Spending
                    </Text>
                  </View>

                  {activeBudget.recentTransactions
                    .slice(0, 10)
                    .map((transaction) => (
                      <TransactionItem
                        key={transaction.transactionId}
                        transaction={transaction}
                      />
                    ))}
                </View>
              )}
          </>
        )}

        {!activeBudget && !isLoadingActiveBudget && !error && (
          <View className="flex-1 items-center justify-center p-8 mt-20">
            <MaterialCommunityIcons
              name="calendar-blank"
              size={80}
              color="#CBD5E1"
            />
            <Text className="text-xl font-semibold text-gray-400 mt-4">
              No Active Budget
            </Text>
            <Text className="text-sm text-gray-500 mt-2 text-center">
              There is no active budget year for your council at the moment.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation Tabs */}
      <View className="flex-row bg-white border-t border-gray-200">
        <TouchableOpacity
          className="flex-1 items-center py-3"
          style={{ backgroundColor: BudgetColors.primary.green + "10" }}
          onPress={() => router.push("/(budget)")}
        >
          <MaterialCommunityIcons
            name="wallet"
            size={24}
            color={BudgetColors.primary.green}
          />
          <Text
            className="text-xs font-semibold mt-1"
            style={{ color: BudgetColors.primary.green }}
          >
            Budget
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 items-center py-3"
          onPress={() => router.push("/(budget)/proposals")}
        >
          <MaterialCommunityIcons
            name="lightbulb-outline"
            size={24}
            color="#94A3B8"
          />
          <Text className="text-xs text-gray-500 mt-1">Ideas</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 items-center py-3"
          onPress={() => router.push("/(budget)/impact")}
        >
          <MaterialCommunityIcons name="chart-line" size={24} color="#94A3B8" />
          <Text className="text-xs text-gray-500 mt-1">My Impact</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
