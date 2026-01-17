import { getPaymentHistory } from "@/api/paymentAction";
import { useAuthStore } from "@/stores/authStore";
import { PaymentHistoryResponseDto } from "@/types";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HistoryScreen() {
  const { userInfo } = useAuthStore();
  const [payments, setPayments] = useState<PaymentHistoryResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    if (userInfo?.sub) {
      fetchPaymentHistory();
    }
  }, [userInfo]);

  const fetchPaymentHistory = async () => {
    try {
      const history = await getPaymentHistory(userInfo!.sub);
      setPayments(history);
    } catch (error) {
      Alert.alert("Error", "Failed to load payment history");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (paymentID: number) => {
    setExpanded((prev) => ({
      ...prev,
      [paymentID]: !prev[paymentID],
    }));
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#c7f9cc]">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-[#c7f9cc]">
      <View className="p-4">
        <Text className="text-xl font-bold mb-4">Payment History</Text>
        {payments.length === 0 ? (
          <Text className="text-base text-gray-700">
            No payment history found.
          </Text>
        ) : (
          payments.map((payment) => (
            <View
              key={payment.paymentID}
              className="mb-4 bg-white p-4 rounded-lg shadow"
            >
              <TouchableOpacity
                onPress={() => toggleExpanded(payment.paymentID)}
              >
                <View className="flex-row justify-between items-center">
                  <Text className="text-lg font-semibold">
                    Payment #{payment.paymentID}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    {expanded[payment.paymentID] ? "Hide" : "Show"} Details
                  </Text>
                </View>
                <Text className="text-base">
                  Date: {new Date(payment.paymentDate).toLocaleDateString()}
                </Text>
                <Text className="text-base">
                  Total: LKR {payment.totalAmount.toFixed(2)}
                </Text>
                <Text className="text-base">
                  Method: {payment.paymentMethod}
                </Text>
              </TouchableOpacity>
              {expanded[payment.paymentID] && (
                <View className="mt-4">
                  <Text className="text-base font-semibold">Details:</Text>
                  <Text>Resident: {payment.residentName}</Text>
                  <Text>Receipt: {payment.receiptNumber}</Text>
                  <Text>Payment Type: {payment.paymentType}</Text>
                  {payment.paymentDetails.map((detail, index) => (
                    <View key={index} className="mt-2 p-2 bg-gray-100 rounded">
                      <Text>
                        Unit: {detail.unitType} (ID: {detail.taxableUnitID})
                      </Text>
                      <Text>Address: {detail.landParcelAddress}</Text>
                      <Text>
                        Year: {detail.assessmentYear}, Value:{" "}
                        {detail.annualValue}, Rate: {detail.taxRate}%
                      </Text>
                      <Text className="font-semibold">Quarters:</Text>
                      {detail.quarters.map((quarter) => (
                        <Text key={quarter.quarter}>
                          Q{quarter.quarter}: {quarter.quarterAmount} (Discount:{" "}
                          {quarter.discount}, Surcharge: {quarter.surcharge})
                        </Text>
                      ))}
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}
