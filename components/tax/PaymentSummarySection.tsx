import { usePaymentCartStore } from "@/stores/paymentCartStore";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

interface PaymentSummarySectionProps {
  onProceedToPayment: () => void;
  processingPayment?: boolean;
}

export default function PaymentSummarySection({
  onProceedToPayment,
  processingPayment = false,
}: PaymentSummarySectionProps) {
  const {
    selectedQuarters,
    getTotalDueAmount,
    getTotalSurcharge,
    getTotalDiscount,
    getTotalAmount,
    clearCart,
  } = usePaymentCartStore();

  const dueAmount = getTotalDueAmount() || 0;
  const surcharge = getTotalSurcharge() || 0;
  const discount = getTotalDiscount() || 0;
  const totalAmount = getTotalAmount() || 0;

  const hasItems = selectedQuarters.length > 0;

  // Group quarters by land parcel for display
  const quartersByParcel = selectedQuarters.reduce(
    (acc, quarter) => {
      const key = quarter.landParcelID;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(quarter);
      return acc;
    },
    {} as Record<number, typeof selectedQuarters>,
  );

  return (
    <ScrollView className="flex-1 bg-[#c7f9cc]">
      <View className="p-4">
        <Text className="text-xl font-bold text-[#22577a] mb-4">
          Payment Cart
        </Text>

        {!hasItems ? (
          <View className="flex-1 items-center justify-center p-8">
            <Ionicons name="cart-outline" size={64} color="#38a3a5" />
            <Text className="text-lg text-[#22577a] mt-4 font-semibold">
              Your cart is empty
            </Text>
            <Text className="text-sm text-[#38a3a5] mt-2 text-center">
              Select unpaid quarters from the previous tab to add them to your
              payment cart
            </Text>
          </View>
        ) : (
          <>
            {/* Selected Quarters Summary */}
            <View className="mb-4 border-2 border-[#38a3a5] rounded-lg overflow-hidden">
              <View className="bg-[#38a3a5] p-3 border-b border-[#38a3a5]">
                <Text className="text-white font-semibold text-base">
                  Selected Quarters ({selectedQuarters.length} item
                  {selectedQuarters.length !== 1 ? "s" : ""})
                </Text>
              </View>
              <View className="bg-white p-4">
                {Object.entries(quartersByParcel).map(
                  ([landParcelId, quarters]) => (
                    <View key={landParcelId} className="mb-3">
                      <Text className="text-[#22577a] font-semibold mb-2">
                        Land Parcel #{landParcelId}
                      </Text>
                      {quarters
                        .sort((a, b) => {
                          if (a.year !== b.year) return a.year - b.year;
                          return a.quarter - b.quarter;
                        })
                        .map((quarter) => (
                          <View
                            key={quarter.assessmentQuarterID}
                            className="flex-row justify-between items-center pl-3 py-1"
                          >
                            <Text className="text-[#22577a] text-sm">
                              Q{quarter.quarter} {quarter.year} -{" "}
                              {quarter.unitReference}
                            </Text>
                            <Text className="text-[#22577a] text-sm font-medium">
                              LKR{" "}
                              {(
                                quarter.dueAmount +
                                quarter.surchargeAmount -
                                quarter.discountAmount
                              ).toFixed(2)}
                            </Text>
                          </View>
                        ))}
                    </View>
                  ),
                )}
              </View>
            </View>

            {/* Payment Breakdown */}
            <View className="mb-4 border-2 border-[#57cc99] rounded-lg overflow-hidden">
              <View className="bg-[#57cc99] p-3 border-b border-[#57cc99]">
                <Text className="text-white font-semibold text-base">
                  Payment Breakdown
                </Text>
              </View>
              <View className="bg-white p-4">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-[#22577a]">Due Amount:</Text>
                  <Text className="text-[#22577a] font-medium">
                    LKR {dueAmount.toFixed(2)}
                  </Text>
                </View>
                {surcharge > 0 && (
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-[#22577a]">Surcharge:</Text>
                    <Text className="text-red-600 font-medium">
                      +LKR {surcharge.toFixed(2)}
                    </Text>
                  </View>
                )}
                {discount > 0 && (
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-[#22577a]">Discount:</Text>
                    <Text className="text-[#57cc99] font-medium">
                      -LKR {discount.toFixed(2)}
                    </Text>
                  </View>
                )}
                <View className="h-px bg-[#c7f9cc] my-2" />
                <View className="flex-row justify-between">
                  <Text className="text-[#22577a] font-semibold">
                    Subtotal:
                  </Text>
                  <Text className="text-[#22577a] font-semibold">
                    LKR {totalAmount.toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Total Amount */}
            <View className="mb-6 bg-[#22577a] rounded-lg p-4 border-2 border-[#38a3a5]">
              <View className="flex-row justify-between items-center">
                <Text className="text-white text-xl font-bold">
                  Total Amount:
                </Text>
                <Text className="text-[#80ed99] text-2xl font-bold">
                  LKR {totalAmount.toFixed(2)}
                </Text>
              </View>
            </View>

            {/* Payment Method Section (Stripe) */}
            <View className="mb-4 border-2 border-[#57cc99] rounded-lg overflow-hidden">
              <View className="bg-[#c7f9cc] p-3 border-b border-[#57cc99]">
                <Text className="text-[#22577a] font-semibold text-base">
                  Payment Method
                </Text>
              </View>
              <View className="bg-white p-4">
                <View className="border-2 border-dashed border-[#57cc99] rounded-lg p-6 items-center">
                  <Ionicons name="card-outline" size={48} color="#38a3a5" />
                  <Text className="text-[#22577a] font-medium mt-2">
                    Stripe Payment Integration
                  </Text>
                  <Text className="text-[#38a3a5] text-sm text-center mt-1">
                    Secure payment gateway
                  </Text>
                  <View className="flex-row items-center mt-3">
                    <Ionicons name="lock-closed" size={16} color="#38a3a5" />
                    <Text className="text-[#38a3a5] text-xs ml-1">
                      Secure payment powered by Stripe
                    </Text>
                  </View>
                </View>

                <Text className="text-[#38a3a5] text-xs mt-4 text-center">
                  We accept credit cards, debit cards, and other payment methods
                  through Stripe&apos;s secure payment platform
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View className="gap-3">
              <Pressable
                className={`p-4 rounded-lg items-center flex-row justify-center ${
                  processingPayment
                    ? "bg-gray-400"
                    : "bg-[#57cc99] active:bg-[#38a3a5]"
                }`}
                onPress={onProceedToPayment}
                disabled={processingPayment}
              >
                {processingPayment ? (
                  <View className="flex-row items-center">
                    <ActivityIndicator size="small" color="white" />
                    <Text className="text-white font-semibold text-base ml-2">
                      Processing Payment...
                    </Text>
                  </View>
                ) : (
                  <View className="flex-row items-center">
                    <Ionicons name="card" size={20} color="white" />
                    <Text className="text-white font-semibold text-base ml-2">
                      Proceed to Payment
                    </Text>
                  </View>
                )}
              </Pressable>

              <Pressable
                className="border-2 border-[#38a3a5] p-4 rounded-lg items-center active:bg-[#c7f9cc]"
                onPress={clearCart}
                disabled={processingPayment}
              >
                <Text
                  className={`font-semibold text-base ${
                    processingPayment ? "text-gray-400" : "text-[#22577a]"
                  }`}
                >
                  Clear Cart
                </Text>
              </Pressable>
            </View>

            {/* Payment Info */}
            <View className="mt-6 bg-[#c7f9cc] p-4 rounded-lg border-2 border-[#80ed99]">
              <View className="flex-row items-start">
                <Ionicons name="information-circle" size={20} color="#38a3a5" />
                <View className="flex-1 ml-2">
                  <Text className="text-[#22577a] font-medium mb-1">
                    Payment Information
                  </Text>
                  <Text className="text-[#22577a] text-sm">
                    • Your payment will be processed securely through Stripe
                  </Text>
                  <Text className="text-[#22577a] text-sm">
                    • You will receive a payment confirmation via email
                  </Text>
                  <Text className="text-[#22577a] text-sm">
                    • Payments cannot be partial - full selected amount required
                  </Text>
                  <Text className="text-[#22577a] text-sm">
                    • Quarters must be paid consecutively
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}
