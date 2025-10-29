import { getOutstandingAmountByResidentId } from "@/api/taxAction";
import { ApiResponse } from "@/types";
import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useAuthStore } from "../../stores/authStore";

export default function SummaryScreen() {
  const [totalOutstanding, setTotalOutstanding] = useState<number | null>(null);

  const { userInfo } = useAuthStore();

  useEffect(() => {
    async function fetchOutstandingAmount() {
      try {
        const residentId = userInfo?.sub; // Replace with actual resident ID
        console.log("Fetching outstanding amount for resident ID:", residentId);
        const response: ApiResponse<number> =
          await getOutstandingAmountByResidentId(residentId);
        if (response.isSuccess) {
          setTotalOutstanding(response.data);
        } else {
          console.error("Failed to fetch outstanding amount:", response);
        }
      } catch (error) {
        console.error("Error fetching outstanding amount:", error);
      }
    }

    if (userInfo?.sub) fetchOutstandingAmount();
  }, [userInfo?.sub]);

  return (
    <ScrollView className="flex-1 bg-[#c7f9cc]">
      <View className="p-4">
        {totalOutstanding !== null ? (
          <Text className="text-lg text-gray-800">
            Total Outstanding: ${totalOutstanding.toFixed(2)}
          </Text>
        ) : (
          <Text className="text-lg text-gray-800">Loading...</Text>
        )}
      </View>
    </ScrollView>
  );
}
