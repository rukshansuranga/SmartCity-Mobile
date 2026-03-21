import {
  ArrearsCartItem,
  usePaymentCartStore,
} from "@/stores/paymentCartStore";
import {
  Arrears,
  LandParcelWithArrears,
  TaxableUnitWithArrears,
} from "@/types";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

interface ArrearsPaymentSectionProps {
  arrears: LandParcelWithArrears[];
  loading: boolean;
  totalOutstanding?: number;
}

export default function ArrearsPaymentSection({
  arrears,
  loading,
  totalOutstanding,
}: ArrearsPaymentSectionProps) {
  const {
    addArrears,
    removeArrears,
    addMultipleArrears,
    isArrearsSelected,
    getTotalArrearsAmount,
    getTotalArrearsSurcharge,
  } = usePaymentCartStore();

  // Convert API arrears to cart items
  const convertToCartItem = useCallback(
    (
      arrear: Arrears,
      taxableUnitID: number,
      unitReference: string,
      landParcelID: number,
    ): ArrearsCartItem => {
      return {
        arrearsID: arrear.arrearsID,
        assessmentId: arrear.assessmentId,
        taxableUnitID: taxableUnitID,
        landParcelID: landParcelID,
        unitReference: unitReference,
        dueQuarter: arrear.dueQuarter,
        outstandingBalance: arrear.outstandingBalance,
        surchargeAccrued: arrear.surchargeAccrued || 0,
      };
    },
    [],
  );

  const handleTaxableUnitToggle = useCallback(
    (taxableUnit: TaxableUnitWithArrears, landParcelID: number) => {
      const cartItems = taxableUnit.arrears.map((arrear) =>
        convertToCartItem(
          arrear,
          taxableUnit.taxableUnitID,
          taxableUnit.unitReference,
          landParcelID,
        ),
      );
      const allSelected = cartItems.every((item) =>
        isArrearsSelected(item.arrearsID),
      );

      if (allSelected) {
        // Remove all arrears for this taxable unit
        cartItems.forEach((item) => removeArrears(item.arrearsID));
      } else {
        addMultipleArrears(cartItems);
      }
    },
    [isArrearsSelected, removeArrears, addMultipleArrears, convertToCartItem],
  );

  const handleArrearsToggle = useCallback(
    (
      arrear: Arrears,
      taxableUnitID: number,
      unitReference: string,
      landParcelID: number,
    ) => {
      const cartItem = convertToCartItem(
        arrear,
        taxableUnitID,
        unitReference,
        landParcelID,
      );
      if (isArrearsSelected(cartItem.arrearsID)) {
        removeArrears(cartItem.arrearsID);
      } else {
        addArrears(cartItem);
      }
    },
    [isArrearsSelected, removeArrears, addArrears, convertToCartItem],
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center p-8 bg-[#c7f9cc]">
        <ActivityIndicator size="large" color="#38a3a5" />
        <Text className="mt-4 text-[#22577a]">Loading arrears...</Text>
      </View>
    );
  }

  if (!arrears || arrears.length === 0) {
    return (
      <View className="flex-1 items-center justify-center p-8 bg-[#c7f9cc]">
        <Text className="text-lg text-[#22577a] font-semibold">
          No arrears found for this account
        </Text>
        <Text className="mt-2 text-sm text-[#38a3a5]">
          All payments are up to date!
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-[#c7f9cc]">
      <View className="p-4">
        <Text className="text-xl font-bold text-[#22577a] mb-4">
          Outstanding Arrears
        </Text>

        {arrears.map((landParcel) => (
          <View key={landParcel.landParcelID} className="mb-6">
            {/* Land Parcel Header */}
            <View className="bg-[#22577a] p-4 rounded-t-lg">
              <Text className="text-white font-bold text-lg">
                {landParcel.streetAddress}
              </Text>
              <Text className="text-[#80ed99] text-sm mt-1">
                Land Parcel ID: {landParcel.landParcelID}
              </Text>
            </View>

            {/* Taxable Units */}
            {landParcel.taxableUnits.map((taxableUnit) => {
              // const totalOutstanding = taxableUnit.arrears.reduce(
              //   (sum, a) => sum + (a.outstandingBalance || 0),
              //   0,
              // );
              const totalSurcharge = taxableUnit.arrears.reduce(
                (sum, a) => sum + (a.surchargeAccrued || 0),
                0,
              );

              const allSelected = taxableUnit.arrears.every((a) =>
                isArrearsSelected(a.arrearsID),
              );

              let outstanding = 0;

              return (
                <View
                  key={taxableUnit.taxableUnitID}
                  className="border-l border-r border-b border-[#38a3a5]"
                >
                  {/* Taxable Unit Header */}
                  <Pressable
                    className="bg-[#38a3a5] p-4 flex-row items-center justify-between"
                    onPress={() =>
                      handleTaxableUnitToggle(
                        taxableUnit,
                        landParcel.landParcelID,
                      )
                    }
                  >
                    <View className="flex-1">
                      <Text className="text-white font-semibold text-base">
                        {taxableUnit.unitReference}
                      </Text>
                      <Text className="text-[#c7f9cc] text-sm mt-1">
                        Type: {taxableUnit.unitType}
                      </Text>
                      <Text className="text-[#80ed99] text-sm">
                        Outstanding: LKR {(totalOutstanding || 0).toFixed(2)} |
                        Surcharge: LKR {(totalSurcharge || 0).toFixed(2)}
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

                  {/* Individual Arrears */}
                  <View className="bg-white">
                    {taxableUnit.arrears.map((arrear) => {
                      const isSelected = isArrearsSelected(arrear.arrearsID);
                      outstanding += arrear.originalDueAmount || 0;
                      return (
                        <Pressable
                          key={arrear.arrearsID}
                          className="p-4 border-b border-[#c7f9cc] flex-row items-center justify-between"
                          onPress={() =>
                            handleArrearsToggle(
                              arrear,
                              taxableUnit.taxableUnitID,
                              taxableUnit.unitReference,
                              landParcel.landParcelID,
                            )
                          }
                        >
                          <View className="flex-1">
                            <View className="flex-row items-center mb-1">
                              <Text className="text-[#22577a] font-medium">
                                {arrear.year}
                                {" - "}
                              </Text>
                              <Text className="text-[#22577a] font-medium">
                                Quarter {arrear.dueQuarter}
                              </Text>
                              <View
                                className={`ml-2 px-2 py-1 rounded ${
                                  arrear.recoveryStatus === "Outstanding"
                                    ? "bg-red-100"
                                    : "bg-[#80ed99]"
                                }`}
                              >
                                <Text
                                  className={`text-xs ${
                                    arrear.recoveryStatus === "Outstanding"
                                      ? "text-red-700"
                                      : "text-[#22577a]"
                                  }`}
                                >
                                  {arrear.recoveryStatus}
                                </Text>
                              </View>
                            </View>
                            <Text className="text-sm text-[#38a3a5]">
                              Original: LKR{" "}
                              {(arrear.originalDueAmount || 0).toFixed(2)}
                            </Text>
                            <Text className="text-sm text-[#22577a] font-semibold">
                              Outstanding: LKR {(outstanding || 0).toFixed(2)}
                            </Text>
                            {arrear.surchargeAccrued &&
                              arrear.surchargeAccrued > 0 && (
                                <Text className="text-sm text-red-600">
                                  Surcharge: LKR{" "}
                                  {(arrear.surchargeAccrued || 0).toFixed(2)}
                                </Text>
                              )}
                          </View>
                          <View
                            className={`w-6 h-6 rounded border-2 items-center justify-center ${
                              isSelected
                                ? "bg-[#57cc99] border-[#57cc99]"
                                : "bg-white border-[#38a3a5]"
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
                </View>
              );
            })}
          </View>
        ))}

        {/* Total Summary */}
        <View className="mt-4 p-4 bg-[#80ed99] rounded-lg border-2 border-[#57cc99]">
          <Text className="text-lg font-bold text-[#22577a] mb-2">
            Selected Arrears Summary
          </Text>
          <View className="flex-row justify-between mb-1">
            <Text className="text-[#22577a]">Outstanding Amount:</Text>
            <Text className="text-[#22577a] font-semibold">
              LKR {(getTotalArrearsAmount() || 0).toFixed(2)}
            </Text>
          </View>
          <View className="flex-row justify-between mb-1">
            <Text className="text-[#22577a]">Surcharge:</Text>
            <Text className="text-red-600 font-semibold">
              LKR {(getTotalArrearsSurcharge() || 0).toFixed(2)}
            </Text>
          </View>
          <View className="h-px bg-[#57cc99] my-2" />
          <View className="flex-row justify-between">
            <Text className="text-lg font-bold text-[#22577a]">
              Total Arrears:
            </Text>
            <Text className="text-lg font-bold text-[#22577a]">
              LKR{" "}
              {(
                (getTotalArrearsAmount() || 0) +
                (getTotalArrearsSurcharge() || 0)
              ).toFixed(2)}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
