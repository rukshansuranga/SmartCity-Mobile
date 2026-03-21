import {
  confirmPayment,
  convertToCents,
  createPaymentIntent,
} from "@/api/paymentAction";
import { getUnpaidQuartersByResidentId } from "@/api/taxAction";
import PaymentSummarySection from "@/components/tax/PaymentSummarySection";
import UnpaidQuartersSection from "@/components/tax/UnpaidQuartersSection";
import { useAuthStore } from "@/stores/authStore";
import { usePaymentCartStore } from "@/stores/paymentCartStore";
import { ApiResponse, UnpaidQuartersByResidentDto } from "@/types";
import { useStripe } from "@stripe/stripe-react-native";
import React, { useEffect, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import Toast from "react-native-toast-message";

type TabType = "unpaid" | "payments";

export default function PaymentScreen() {
  const { userInfo } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>("unpaid");
  const [unpaidQuarters, setUnpaidQuarters] = useState<
    UnpaidQuartersByResidentDto[]
  >([]);
  const [loadingUnpaid, setLoadingUnpaid] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  const { getTotalAmount, selectedQuarters, clearCart } = usePaymentCartStore();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const residentId = userInfo?.sub;

  // Fetch unpaid quarters data function
  const fetchUnpaidQuarters = React.useCallback(async () => {
    if (!residentId) return;

    setLoadingUnpaid(true);
    try {
      const response: ApiResponse<UnpaidQuartersByResidentDto[]> =
        await getUnpaidQuartersByResidentId(residentId);

      if (response.isSuccess && response.data) {
        setUnpaidQuarters(response.data);
      } else {
        console.error("Failed to fetch unpaid quarters:", response.message);
      }
    } catch (error) {
      console.error("Error fetching unpaid quarters:", error);
    } finally {
      setLoadingUnpaid(false);
    }
  }, [residentId]);

  // Fetch unpaid quarters data on mount
  useEffect(() => {
    fetchUnpaidQuarters();
  }, [fetchUnpaidQuarters]);

  const handleProceedToPayment = async () => {
    const total = getTotalAmount();
    if (total === 0) {
      Alert.alert(
        "Cart Empty",
        "Please select quarters to pay before proceeding to payment.",
        [{ text: "OK" }],
      );
      return;
    }

    if (!residentId) {
      Alert.alert("Error", "User not authenticated", [{ text: "OK" }]);
      return;
    }

    setProcessingPayment(true);

    try {
      // Step 1: Prepare payment data
      const assessmentQuarterIds = selectedQuarters.map(
        (item) => item.assessmentQuarterID,
      );

      const description = `Tax Payment - ${assessmentQuarterIds.length} quarters`;

      const paymentIntentResponse = await createPaymentIntent({
        amount: convertToCents(total),
        currency: "lkr",
        residentId,
        assessmentQuarterIds: assessmentQuarterIds.map(String),
        description,
      });

      if (!paymentIntentResponse) {
        throw new Error("Failed to create payment intent");
      }

      const { clientSecret, paymentIntentId } = paymentIntentResponse;

      // Step 3: Initialize Stripe Payment Sheet
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: "Smart City",
        paymentIntentClientSecret: clientSecret,
        defaultBillingDetails: {
          name: userInfo?.name || userInfo?.given_name || "Resident",
        },
        returnURL: "smartcity://payment-success",
      });

      if (initError) {
        throw new Error(initError.message);
      }

      // Step 4: Present Payment Sheet
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        if (presentError.code === "Canceled") {
          Toast.show({
            type: "info",
            text1: "Payment Cancelled",
            text2: "You cancelled the payment",
          });
        } else {
          throw new Error(presentError.message);
        }
        return;
      }

      // Step 5: Payment successful - Confirm on backend
      Toast.show({
        type: "info",
        text1: "Processing payment...",
        text2: "Please wait",
      });

      const confirmResponse = await confirmPayment({
        paymentIntentId,
        assessmentQuarterIds: assessmentQuarterIds,
      });

      if (!confirmResponse) {
        throw new Error("Failed to confirm payment");
      }

      // Step 6: Success - Clear cart and show confirmation
      clearCart();

      Alert.alert(
        "Payment Successful! 🎉",
        `Your payment of LKR ${total.toFixed(2)} has been processed successfully.\n\nTransaction ID: ${confirmResponse.transactionId}`,
        [
          {
            text: "OK",
            onPress: () => {
              // Refresh data after payment
              fetchUnpaidQuarters();
            },
          },
        ],
      );

      Toast.show({
        type: "success",
        text1: "Payment Successful",
        text2: `LKR ${total.toFixed(2)} paid successfully`,
      });
    } catch (error: any) {
      console.error("Payment error:", error);
      Alert.alert(
        "Payment Failed",
        error.message || "An error occurred during payment processing",
        [{ text: "OK" }],
      );

      Toast.show({
        type: "error",
        text1: "Payment Failed",
        text2: error.message || "Please try again",
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  if (!residentId) {
    return (
      <View className="flex-1 bg-[#c7f9cc] items-center justify-center p-8">
        <Text className="text-xl font-bold text-[#22577a] text-center">
          User Not Authenticated
        </Text>
        <Text className="text-base text-gray-700 mt-2 text-center">
          Please sign in to access payment features.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#c7f9cc]">
      {/* Segmented Control / Tab Switcher */}
      <View className="bg-white px-4 py-3 flex-row border-b border-[#c7f9cc]">
        <Pressable
          className={`flex-1 py-3 px-4 rounded-lg mr-2 items-center ${
            activeTab === "unpaid" ? "bg-[#38a3a5]" : "bg-[#c7f9cc]"
          }`}
          onPress={() => setActiveTab("unpaid")}
        >
          <Text
            className={`font-semibold ${
              activeTab === "unpaid" ? "text-white" : "text-[#22577a]"
            }`}
          >
            Unpaid/Overdue
          </Text>
        </Pressable>

        <Pressable
          className={`flex-1 py-3 px-4 rounded-lg items-center ${
            activeTab === "payments" ? "bg-[#57cc99]" : "bg-[#c7f9cc]"
          }`}
          onPress={() => setActiveTab("payments")}
        >
          <Text
            className={`font-semibold ${
              activeTab === "payments" ? "text-white" : "text-[#22577a]"
            }`}
          >
            Payment Cart
          </Text>
        </Pressable>
      </View>

      {/* Tab Content */}
      <View className="flex-1">
        {activeTab === "unpaid" && (
          <UnpaidQuartersSection
            unpaidQuarters={unpaidQuarters}
            loading={loadingUnpaid}
          />
        )}

        {activeTab === "payments" && (
          <PaymentSummarySection
            onProceedToPayment={handleProceedToPayment}
            processingPayment={processingPayment}
          />
        )}
      </View>
    </View>
  );
}
