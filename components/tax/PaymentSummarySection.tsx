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
    selectedArrears,
    selectedQuarterlyTax,
    getTotalArrearsAmount,
    getTotalArrearsSurcharge,
    getTotalQuarterlyTaxAmount,
    getTotalQuarterlyDiscount,
    getTotalAmount,
    clearCart,
  } = usePaymentCartStore();

  const arrearsAmount = getTotalArrearsAmount();
  const arrearsSurcharge = getTotalArrearsSurcharge();
  const quarterlyAmount = getTotalQuarterlyTaxAmount();
  const quarterlyDiscount = getTotalQuarterlyDiscount();
  const totalAmount = getTotalAmount();

  const hasItems =
    selectedArrears.length > 0 || selectedQuarterlyTax.length > 0;

  return (
    <ScrollView className="flex-1 bg-[#c7f9cc]">
      <View className="p-4">
        <Text className="text-xl font-bold text-[#22577a] mb-4">
          Payment Summary
        </Text>

        {!hasItems ? (
          <View className="flex-1 items-center justify-center p-8">
            <Ionicons name="cart-outline" size={64} color="#38a3a5" />
            <Text className="text-lg text-[#22577a] mt-4 font-semibold">
              Your cart is empty
            </Text>
            <Text className="text-sm text-[#38a3a5] mt-2 text-center">
              Select arrears or quarterly taxes from the previous tabs to add
              them to your payment cart
            </Text>
          </View>
        ) : (
          <>
            {/* Arrears Summary */}
            {selectedArrears.length > 0 && (
              <View className="mb-4 border-2 border-[#38a3a5] rounded-lg overflow-hidden">
                <View className="bg-[#38a3a5] p-3 border-b border-[#38a3a5]">
                  <Text className="text-white font-semibold text-base">
                    Arrears ({selectedArrears.length} item
                    {selectedArrears.length !== 1 ? "s" : ""})
                  </Text>
                </View>
                <View className="bg-white p-4">
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-[#22577a]">Outstanding Amount:</Text>
                    <Text className="text-[#22577a] font-medium">
                      LKR {arrearsAmount.toFixed(2)}
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-[#22577a]">Surcharge:</Text>
                    <Text className="text-red-600 font-medium">
                      LKR {arrearsSurcharge.toFixed(2)}
                    </Text>
                  </View>
                  <View className="h-px bg-[#c7f9cc] my-2" />
                  <View className="flex-row justify-between">
                    <Text className="text-[#22577a] font-semibold">
                      Subtotal (Arrears):
                    </Text>
                    <Text className="text-[#22577a] font-semibold">
                      LKR {(arrearsAmount + arrearsSurcharge).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Quarterly Tax Summary */}
            {selectedQuarterlyTax.length > 0 && (
              <View className="mb-4 border-2 border-[#57cc99] rounded-lg overflow-hidden">
                <View className="bg-[#57cc99] p-3 border-b border-[#57cc99]">
                  <Text className="text-white font-semibold text-base">
                    Current & Future Quarters ({selectedQuarterlyTax.length}{" "}
                    item
                    {selectedQuarterlyTax.length !== 1 ? "s" : ""})
                  </Text>
                </View>
                <View className="bg-white p-4">
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-[#22577a]">Quarterly Tax:</Text>
                    <Text className="text-[#22577a] font-medium">
                      LKR {(quarterlyAmount + quarterlyDiscount).toFixed(2)}
                    </Text>
                  </View>
                  {quarterlyDiscount > 0 && (
                    <View className="flex-row justify-between mb-2">
                      <Text className="text-[#22577a]">Discount:</Text>
                      <Text className="text-[#57cc99] font-medium">
                        -LKR {quarterlyDiscount.toFixed(2)}
                      </Text>
                    </View>
                  )}
                  <View className="h-px bg-[#c7f9cc] my-2" />
                  <View className="flex-row justify-between">
                    <Text className="text-[#22577a] font-semibold">
                      Subtotal (Quarterly):
                    </Text>
                    <Text className="text-[#22577a] font-semibold">
                      LKR {quarterlyAmount.toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            )}

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

            {/* Payment Method Section (Stripe Placeholder) */}
            <View className="mb-4 border-2 border-[#57cc99] rounded-lg overflow-hidden">
              <View className="bg-[#c7f9cc] p-3 border-b border-[#57cc99]">
                <Text className="text-[#22577a] font-semibold text-base">
                  Payment Method
                </Text>
              </View>
              <View className="bg-white p-4">
                {/* Stripe Payment Button Placeholder */}
                <View className="border-2 border-dashed border-[#57cc99] rounded-lg p-6 items-center">
                  <Ionicons name="card-outline" size={48} color="#38a3a5" />
                  <Text className="text-[#22577a] font-medium mt-2">
                    Stripe Payment Integration
                  </Text>
                  <Text className="text-[#38a3a5] text-sm text-center mt-1">
                    Payment gateway will be integrated here
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
                  <Text className="text-blue-800 text-sm">
                    • You will receive a payment confirmation via email
                  </Text>
                  <Text className="text-blue-800 text-sm">
                    • Discount deadlines apply for quarterly taxes
                  </Text>
                  <Text className="text-blue-800 text-sm">
                    • Arrears must be paid to avoid additional surcharges
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
