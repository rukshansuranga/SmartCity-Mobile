import {
  QuarterlyTaxCartItem,
  usePaymentCartStore,
} from "@/stores/paymentCartStore";
import { QuarterlyTaxByResidentDto } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

interface QuarterlyTaxPaymentSectionProps {
  quarterlyTax: QuarterlyTaxByResidentDto[];
  loading: boolean;
}

export default function QuarterlyTaxPaymentSection({
  quarterlyTax,
  loading,
}: QuarterlyTaxPaymentSectionProps) {
  const {
    addQuarterlyTax,
    removeQuarterlyTax,
    addMultipleQuarterlyTax,
    removeQuarterlyTaxForLandParcel,
    isQuarterlyTaxSelected,
    canSelectQuarter,
    getTotalQuarterlyTaxAmount,
    getTotalQuarterlyDiscount,
  } = usePaymentCartStore();

  // Convert API data to cart items
  const convertToCartItem = useCallback(
    (
      landParcel: QuarterlyTaxByResidentDto,
      taxableUnit: any,
      quarter: any,
    ): QuarterlyTaxCartItem => {
      return {
        taxableUnitID: taxableUnit.taxableUnitID,
        landParcelID: landParcel.landParcelID,
        unitReference: taxableUnit.unitReference,
        taxYear: quarter.taxYear,
        quarter: quarter.quarter,
        quarterName: quarter.quarterName,
        quarterlyTaxAmount: quarter.quarterlyTaxAmount,
        discountAmount: quarter.discountAmount,
        amountDue: quarter.amountDue,
        isDiscountApplicable: quarter.isDiscountApplicable,
      };
    },
    [],
  );

  const handleLandParcelToggle = useCallback(
    (landParcel: QuarterlyTaxByResidentDto) => {
      const allItems: QuarterlyTaxCartItem[] = [];

      landParcel.taxableUnits.forEach((unit) => {
        unit.quarterlyTaxes
          .filter((q) => !q.isPaid)
          .forEach((q) => {
            allItems.push(convertToCartItem(landParcel, unit, q));
          });
      });

      const allSelected = allItems.every((item) =>
        isQuarterlyTaxSelected(item.taxableUnitID, item.taxYear, item.quarter),
      );

      if (allSelected) {
        removeQuarterlyTaxForLandParcel(landParcel.landParcelID);
      } else {
        // Only add items that follow the quarter ordering rule
        const validItems = allItems.filter((item) =>
          canSelectQuarter(item.taxableUnitID, item.taxYear, item.quarter),
        );
        addMultipleQuarterlyTax(validItems);
      }
    },
    [
      isQuarterlyTaxSelected,
      removeQuarterlyTaxForLandParcel,
      addMultipleQuarterlyTax,
      canSelectQuarter,
      convertToCartItem,
    ],
  );

  const handleQuarterToggle = useCallback(
    (landParcel: QuarterlyTaxByResidentDto, taxableUnit: any, quarter: any) => {
      const cartItem = convertToCartItem(landParcel, taxableUnit, quarter);
      const isSelected = isQuarterlyTaxSelected(
        cartItem.taxableUnitID,
        cartItem.taxYear,
        cartItem.quarter,
      );

      if (isSelected) {
        removeQuarterlyTax(
          cartItem.taxableUnitID,
          cartItem.taxYear,
          cartItem.quarter,
        );
      } else {
        // Check if this quarter can be selected (ordering rule)
        if (
          canSelectQuarter(
            cartItem.taxableUnitID,
            cartItem.taxYear,
            cartItem.quarter,
          )
        ) {
          addQuarterlyTax(cartItem);
        }
      }
    },
    [
      isQuarterlyTaxSelected,
      removeQuarterlyTax,
      addQuarterlyTax,
      canSelectQuarter,
      convertToCartItem,
    ],
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center p-8 bg-[#c7f9cc]">
        <ActivityIndicator size="large" color="#57cc99" />
        <Text className="mt-4 text-[#22577a]">Loading quarterly taxes...</Text>
      </View>
    );
  }

  if (!quarterlyTax || quarterlyTax.length === 0) {
    return (
      <View className="flex-1 items-center justify-center p-8 bg-[#c7f9cc]">
        <Text className="text-lg text-[#22577a] font-semibold">
          No quarterly tax information available
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-[#c7f9cc]">
      <View className="p-4">
        <Text className="text-xl font-bold text-[#22577a] mb-2">
          Current & Future Quarters
        </Text>
        <Text className="text-sm text-[#38a3a5] mb-4">
          Note: You can pay current and past quarters anytime. For future
          quarters, you can only pay the next consecutive quarter.
        </Text>

        {quarterlyTax.map((landParcel) => {
          const unpaidQuarters = landParcel.taxableUnits.flatMap((unit) =>
            unit.quarterlyTaxes.filter((q) => !q.isPaid),
          );

          if (unpaidQuarters.length === 0) return null;

          const totalAmount = unpaidQuarters.reduce(
            (sum, q) => sum + (q.amountDue || 0),
            0,
          );
          const totalDiscount = unpaidQuarters.reduce(
            (sum, q) => sum + (q.discountAmount || 0),
            0,
          );

          const allItems: QuarterlyTaxCartItem[] = [];
          landParcel.taxableUnits.forEach((unit) => {
            unit.quarterlyTaxes
              .filter((q) => !q.isPaid)
              .forEach((q) => {
                allItems.push(convertToCartItem(landParcel, unit, q));
              });
          });

          const allSelected = allItems.every((item) =>
            isQuarterlyTaxSelected(
              item.taxableUnitID,
              item.taxYear,
              item.quarter,
            ),
          );

          return (
            <View
              key={landParcel.landParcelID}
              className="mb-4 border-2 border-[#57cc99] rounded-lg overflow-hidden"
            >
              {/* Land Parcel Header */}
              <Pressable
                className="bg-[#57cc99] p-4 flex-row items-center justify-between"
                onPress={() => handleLandParcelToggle(landParcel)}
              >
                <View className="flex-1">
                  <Text className="text-white font-semibold text-base">
                    {landParcel.streetAddress}
                  </Text>
                  <Text className="text-[#c7f9cc] text-sm mt-1">
                    {unpaidQuarters.length} unpaid quarter
                    {unpaidQuarters.length !== 1 ? "s" : ""}
                  </Text>
                  <Text className="text-[#80ed99] text-sm">
                    Total: LKR {(totalAmount || 0).toFixed(2)}
                    {totalDiscount > 0 &&
                      ` (Discount: LKR ${(totalDiscount || 0).toFixed(2)})`}
                  </Text>
                </View>
                <View
                  className={`w-6 h-6 rounded border-2 items-center justify-center ${
                    allSelected
                      ? "bg-[#80ed99] border-[#80ed99]"
                      : "bg-white border-white"
                  }`}
                >
                  {allSelected && (
                    <Ionicons name="checkmark" size={18} color="#22577a" />
                  )}
                </View>
              </Pressable>

              {/* Taxable Units */}
              <View className="bg-white">
                {landParcel.taxableUnits.map((unit) => {
                  const unpaidUnitQuarters = unit.quarterlyTaxes.filter(
                    (q) => !q.isPaid,
                  );

                  if (unpaidUnitQuarters.length === 0) return null;

                  return (
                    <View
                      key={unit.taxableUnitID}
                      className="border-b border-[#c7f9cc]"
                    >
                      <View className="bg-[#c7f9cc] p-3">
                        <Text className="text-[#22577a] font-semibold">
                          {unit.unitReference} - {unit.unitType}
                        </Text>
                      </View>

                      {unpaidUnitQuarters.map((quarter) => {
                        const isSelected = isQuarterlyTaxSelected(
                          unit.taxableUnitID,
                          quarter.taxYear,
                          quarter.quarter,
                        );
                        const canSelect = canSelectQuarter(
                          unit.taxableUnitID,
                          quarter.taxYear,
                          quarter.quarter,
                        );

                        return (
                          <Pressable
                            key={`${quarter.taxYear}-${quarter.quarter}`}
                            className={`p-4 flex-row items-center justify-between border-b border-[#c7f9cc] ${
                              !canSelect && !isSelected ? "opacity-50" : ""
                            }`}
                            onPress={() =>
                              handleQuarterToggle(landParcel, unit, quarter)
                            }
                            disabled={!canSelect && !isSelected}
                          >
                            <View className="flex-1">
                              <View className="flex-row items-center mb-1">
                                <Text className="text-[#22577a] font-medium">
                                  {quarter.quarterName}
                                </Text>
                                {quarter.isDiscountApplicable && (
                                  <View className="ml-2 px-2 py-1 rounded bg-[#80ed99]">
                                    <Text className="text-xs text-[#22577a]">
                                      Discount Available
                                    </Text>
                                  </View>
                                )}
                                {!canSelect && !isSelected && (
                                  <View className="ml-2 px-2 py-1 rounded bg-[#c7f9cc]">
                                    <Text className="text-xs text-[#38a3a5]">
                                      Select previous quarters first
                                    </Text>
                                  </View>
                                )}
                              </View>

                              <Text className="text-sm text-[#38a3a5]">
                                Base Amount: LKR{" "}
                                {(quarter.quarterlyTaxAmount || 0).toFixed(2)}
                              </Text>
                              {quarter.discountAmount &&
                                quarter.discountAmount > 0 && (
                                  <Text className="text-sm text-[#57cc99]">
                                    Discount: -LKR{" "}
                                    {(quarter.discountAmount || 0).toFixed(2)}
                                  </Text>
                                )}
                              <Text className="text-sm text-[#22577a] font-semibold">
                                Amount Due: LKR{" "}
                                {(quarter.amountDue || 0).toFixed(2)}
                              </Text>
                              {quarter.discountDeadline && (
                                <Text className="text-xs text-[#38a3a5] mt-1">
                                  Discount valid until:{" "}
                                  {new Date(
                                    quarter.discountDeadline,
                                  ).toLocaleDateString()}
                                </Text>
                              )}
                            </View>

                            <View
                              className={`w-6 h-6 rounded border-2 items-center justify-center ${
                                isSelected
                                  ? "bg-[#57cc99] border-[#57cc99]"
                                  : canSelect
                                    ? "bg-white border-[#38a3a5]"
                                    : "bg-[#c7f9cc] border-[#c7f9cc]"
                              }`}
                            >
                              {isSelected && (
                                <Ionicons
                                  name="checkmark"
                                  size={18}
                                  color="white"
                                />
                              )}
                            </View>
                          </Pressable>
                        );
                      })}
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}

        {/* Total Summary */}
        <View className="mt-4 p-4 bg-[#80ed99] rounded-lg border-2 border-[#57cc99]">
          <Text className="text-lg font-bold text-[#22577a] mb-2">
            Selected Quarterly Tax Summary
          </Text>
          <View className="flex-row justify-between mb-1">
            <Text className="text-[#22577a]">Discount Savings:</Text>
            <Text className="text-[#57cc99] font-semibold">
              -LKR {(getTotalQuarterlyDiscount() || 0).toFixed(2)}
            </Text>
          </View>
          <View className="h-px bg-[#57cc99] my-2" />
          <View className="flex-row justify-between">
            <Text className="text-lg font-bold text-[#22577a]">
              Total Amount:
            </Text>
            <Text className="text-lg font-bold text-[#22577a]">
              LKR {(getTotalQuarterlyTaxAmount() || 0).toFixed(2)}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
