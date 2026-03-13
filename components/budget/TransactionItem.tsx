import { BudgetTransaction } from "@/types/budget";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, View } from "react-native";

interface TransactionItemProps {
  transaction: BudgetTransaction;
}

export function TransactionItem({ transaction }: TransactionItemProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <View className="bg-white rounded-lg p-4 mb-2 border border-gray-100">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 mr-3">
          <View className="flex-row items-center mb-1">
            <MaterialCommunityIcons
              name="office-building-outline"
              size={16}
              color="#2A9D8F"
            />
            <Text className="text-base font-semibold text-gray-800 ml-2">
              {transaction.vendor || "Unknown Vendor"}
            </Text>
          </View>

          {transaction.description && (
            <Text className="text-sm text-gray-600 mb-2" numberOfLines={2}>
              {transaction.description}
            </Text>
          )}

          <View className="flex-row items-center">
            <MaterialCommunityIcons name="calendar" size={14} color="#64748B" />
            <Text className="text-xs text-gray-500 ml-1">
              {formatDate(transaction.transactionDate)}
            </Text>
            {transaction.invoiceNumber && (
              <>
                <Text className="text-xs text-gray-400 mx-2">•</Text>
                <Text className="text-xs text-gray-500">
                  #{transaction.invoiceNumber}
                </Text>
              </>
            )}
          </View>
        </View>

        <View className="items-end">
          <Text className="text-lg font-bold text-gray-800">
            ${transaction.amount.toLocaleString()}
          </Text>
        </View>
      </View>
    </View>
  );
}
