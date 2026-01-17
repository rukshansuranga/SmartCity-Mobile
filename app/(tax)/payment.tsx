import {
  confirmPayment,
  convertToCents,
  createPaymentIntent,
  formatQuarterlyTaxId,
} from "@/api/paymentAction";
import {
  getArrearsByResidentId,
  getQuarterlyTaxByResidentId,
} from "@/api/taxAction";
import ArrearsPaymentSection from "@/components/tax/ArrearsPaymentSection";
import PaymentSummarySection from "@/components/tax/PaymentSummarySection";
import QuarterlyTaxPaymentSection from "@/components/tax/QuarterlyTaxPaymentSection";
import { useAuthStore } from "@/stores/authStore";
import { usePaymentCartStore } from "@/stores/paymentCartStore";
import {
  ApiResponse,
  LandParcelWithArrears,
  QuarterlyTaxByResidentDto,
} from "@/types";
import { useStripe } from "@stripe/stripe-react-native";
import React, { useEffect, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import Toast from "react-native-toast-message";

type TabType = "arrears" | "quarterly" | "payments";

export default function PaymentScreen() {
  const { userInfo } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>("arrears");
  const [arrears, setArrears] = useState<LandParcelWithArrears[]>([]);
  const [quarterlyTax, setQuarterlyTax] = useState<QuarterlyTaxByResidentDto[]>(
    [],
  );
  const [loadingArrears, setLoadingArrears] = useState(false);
  const [loadingQuarterly, setLoadingQuarterly] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  const { getTotalAmount, selectedArrears, selectedQuarterlyTax, clearCart } =
    usePaymentCartStore();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const residentId = userInfo?.sub;

  // Fetch arrears data on mount
  useEffect(() => {
    fetchArrears();
  }, [residentId]);

  // Fetch quarterly tax data on mount
  // useEffect(() => {
  //   fetchQuarterlyTax();
  // }, [residentId]);

  const handleProceedToPayment = async () => {
    const total = getTotalAmount();
    if (total === 0) {
      Alert.alert(
        "Cart Empty",
        "Please select items to pay before proceeding to payment.",
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
      const arrearsIds = selectedArrears.map((item) => item.arrearsID);
      const quarterlyTaxIds = selectedQuarterlyTax.map((item) =>
        formatQuarterlyTaxId(item.taxableUnitID, item.taxYear, item.quarter),
      );

      const description = `Tax Payment - ${arrearsIds.length} arrears, ${quarterlyTaxIds.length} quarterly taxes`;

      const paymentIntentResponse = await createPaymentIntent({
        amount: convertToCents(total),
        currency: "lkr",
        residentId,
        arrearsIds,
        quarterlyTaxIds,
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
        residentId,
        arrearsIds,
        quarterlyTaxIds,
        total,
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
              fetchArrears();
              fetchQuarterlyTax();
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

  // Fetch arrears data function (extracted for reuse)
  const fetchArrears = async () => {
    if (!residentId) return;

    setLoadingArrears(true);
    try {
      const response: ApiResponse<LandParcelWithArrears[]> =
        await getArrearsByResidentId(residentId);

      if (response.isSuccess && response.data) {
        setArrears(response.data);
      } else {
        console.error("Failed to fetch arrears:", response.message);
      }
    } catch (error) {
      console.error("Error fetching arrears:", error);
    } finally {
      setLoadingArrears(false);
    }
  };

  // Fetch quarterly tax data function (extracted for reuse)
  const fetchQuarterlyTax = async () => {
    if (!residentId) return;

    setLoadingQuarterly(true);
    try {
      const response: ApiResponse<QuarterlyTaxByResidentDto[]> =
        await getQuarterlyTaxByResidentId(residentId);

      if (response.isSuccess && response.data) {
        setQuarterlyTax(response.data);
      } else {
        console.error("Failed to fetch quarterly tax:", response.message);
      }
    } catch (error) {
      console.error("Error fetching quarterly tax:", error);
    } finally {
      setLoadingQuarterly(false);
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
            activeTab === "arrears" ? "bg-[#38a3a5]" : "bg-[#c7f9cc]"
          }`}
          onPress={() => setActiveTab("arrears")}
        >
          <Text
            className={`font-semibold ${
              activeTab === "arrears" ? "text-white" : "text-[#22577a]"
            }`}
          >
            Arrears
          </Text>
        </Pressable>

        <Pressable
          className={`flex-1 py-3 px-4 rounded-lg mr-2 items-center ${
            activeTab === "quarterly" ? "bg-[#57cc99]" : "bg-[#c7f9cc]"
          }`}
          onPress={() => setActiveTab("quarterly")}
        >
          <Text
            className={`font-semibold ${
              activeTab === "quarterly" ? "text-white" : "text-[#22577a]"
            }`}
          >
            Quarterly
          </Text>
        </Pressable>

        <Pressable
          className={`flex-1 py-3 px-4 rounded-lg items-center ${
            activeTab === "payments" ? "bg-[#80ed99]" : "bg-[#c7f9cc]"
          }`}
          onPress={() => setActiveTab("payments")}
        >
          <Text
            className={`font-semibold ${
              activeTab === "payments" ? "text-[#22577a]" : "text-[#22577a]"
            }`}
          >
            Payments
          </Text>
        </Pressable>
      </View>

      {/* Tab Content */}
      <View className="flex-1">
        {activeTab === "arrears" && (
          <ArrearsPaymentSection arrears={arrears} loading={loadingArrears} />
        )}

        {activeTab === "quarterly" && (
          <QuarterlyTaxPaymentSection
            quarterlyTax={quarterlyTax}
            loading={loadingQuarterly}
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
