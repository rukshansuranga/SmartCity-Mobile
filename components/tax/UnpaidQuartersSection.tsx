import { usePaymentCartStore } from "@/stores/paymentCartStore";
import { UnpaidQuarterCartItem, UnpaidQuartersByResidentDto } from "@/types";
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

interface UnpaidQuartersSectionProps {
  unpaidQuarters: UnpaidQuartersByResidentDto[];
  loading: boolean;
}

export default function UnpaidQuartersSection({
  unpaidQuarters,
  loading,
}: UnpaidQuartersSectionProps) {
  const { addQuarter, removeQuarter, isQuarterSelected, canSelectQuarter } =
    usePaymentCartStore();

  // State to track expanded land parcels
  const [expandedParcels, setExpandedParcels] = useState<Set<number>>(
    new Set(),
  );

  // State to track expanded taxable units
  const [expandedUnits, setExpandedUnits] = useState<Set<number>>(new Set());

  // Expand first land parcel and its taxable units by default
  useEffect(() => {
    if (unpaidQuarters.length > 0) {
      const firstParcel = unpaidQuarters[0];
      setExpandedParcels(new Set([firstParcel.landParcelID]));

      // Expand all taxable units of the first parcel
      const firstParcelUnits = firstParcel.taxableUnits.map(
        (unit) => unit.taxableUnitID,
      );
      setExpandedUnits(new Set(firstParcelUnits));
    }
  }, [unpaidQuarters]);

  const toggleParcelExpansion = (landParcelID: number) => {
    setExpandedParcels((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(landParcelID)) {
        newSet.delete(landParcelID);
      } else {
        newSet.add(landParcelID);
      }
      return newSet;
    });
  };

  const toggleUnitExpansion = (taxableUnitID: number) => {
    setExpandedUnits((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(taxableUnitID)) {
        newSet.delete(taxableUnitID);
      } else {
        newSet.add(taxableUnitID);
      }
      return newSet;
    });
  };

  // Get all quarters as cart items for validation
  const getAllQuartersAsCartItems = (): UnpaidQuarterCartItem[] => {
    const allQuarters: UnpaidQuarterCartItem[] = [];
    unpaidQuarters.forEach((parcel) => {
      parcel.taxableUnits.forEach((unit) => {
        unit.unpaidQuarters.forEach((quarter) => {
          allQuarters.push({
            assessmentQuarterID: quarter.assessmentQuarterID,
            assessmentID: quarter.assessmentID,
            taxableUnitID: unit.taxableUnitID,
            landParcelID: parcel.landParcelID,
            unitReference: unit.unitReference,
            quarter: quarter.quarter,
            year: quarter.year,
            dueAmount: quarter.dueAmount,
            surchargeAmount: quarter.surchargeAmount,
            discountAmount: quarter.discountAmount,
            paymentStatus: quarter.paymentStatus,
          });
        });
      });
    });
    return allQuarters;
  };

  const handleQuarterToggle = (
    assessmentQuarterID: number,
    taxableUnitID: number,
    year: number,
    quarter: number,
  ) => {
    const allQuarters = getAllQuartersAsCartItems();
    const quarterData = allQuarters.find(
      (q) => q.assessmentQuarterID === assessmentQuarterID,
    );

    if (!quarterData) return;

    const isSelected = isQuarterSelected(assessmentQuarterID);

    if (isSelected) {
      // Remove the quarter
      removeQuarter(assessmentQuarterID);
    } else {
      // Check if can select (consecutive validation)
      const canSelect = canSelectQuarter(
        taxableUnitID,
        year,
        quarter,
        allQuarters,
      );

      if (canSelect) {
        addQuarter(quarterData);
      } else {
        // Show alert or toast that consecutive quarters must be selected
        alert("Please select quarters consecutively");
      }
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#c7f9cc]">
        <ActivityIndicator size="large" color="#38a3a5" />
        <Text className="mt-4 text-[#22577a] font-semibold">
          Loading unpaid quarters...
        </Text>
      </View>
    );
  }

  if (unpaidQuarters.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-[#c7f9cc] p-8">
        <Feather name="check-circle" size={64} color="#57cc99" />
        <Text className="text-xl font-bold text-[#22577a] mt-4 text-center">
          All Caught Up!
        </Text>
        <Text className="text-base text-gray-700 mt-2 text-center">
          You have no unpaid or overdue tax quarters.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-[#c7f9cc]">
      <View className="p-4">
        {/* Info Banner */}
        <View className="bg-blue-100 border border-blue-300 rounded-lg p-3 mb-4">
          <Text className="text-blue-800 text-sm font-medium">
            ℹ️ Select consecutive quarters only (e.g., Q3, Q3+Q4, Q3+Q4+Q1)
          </Text>
        </View>

        {/* Land Parcels */}
        {unpaidQuarters.map((parcel) => {
          const isParcelExpanded = expandedParcels.has(parcel.landParcelID);

          return (
            <View
              key={parcel.landParcelID}
              className="bg-white rounded-lg mb-3 overflow-hidden shadow-sm"
            >
              {/* Land Parcel Header */}
              <Pressable
                onPress={() => toggleParcelExpansion(parcel.landParcelID)}
                className="flex-row items-center justify-between p-4 bg-[#38a3a5]"
              >
                <View className="flex-1">
                  <Text className="text-white font-bold text-base">
                    📍 {parcel.streetAddress}
                  </Text>
                  <Text className="text-white/80 text-xs mt-1">
                    Land Parcel ID: {parcel.landParcelID}
                  </Text>
                </View>
                <Feather
                  name={isParcelExpanded ? "chevron-up" : "chevron-down"}
                  size={24}
                  color="white"
                />
              </Pressable>

              {/* Taxable Units */}
              {isParcelExpanded &&
                parcel.taxableUnits.map((unit) => {
                  const isUnitExpanded = expandedUnits.has(unit.taxableUnitID);
                  const allQuarters = getAllQuartersAsCartItems();
                  const unitQuarters = allQuarters.filter(
                    (q) => q.taxableUnitID === unit.taxableUnitID,
                  );

                  return (
                    <View
                      key={unit.taxableUnitID}
                      className="border-t border-gray-200"
                    >
                      {/* Taxable Unit Header */}
                      <Pressable
                        onPress={() => toggleUnitExpansion(unit.taxableUnitID)}
                        className="flex-row items-center justify-between p-3 bg-gray-50"
                      >
                        <View className="flex-1">
                          <Text className="text-[#22577a] font-semibold text-sm">
                            🏠 {unit.unitType} - {unit.unitReference}
                          </Text>
                          <Text className="text-gray-600 text-xs mt-1">
                            Outstanding: LKR {unit.outstanding.toFixed(2)}
                          </Text>
                        </View>
                        <Feather
                          name={isUnitExpanded ? "chevron-up" : "chevron-down"}
                          size={20}
                          color="#22577a"
                        />
                      </Pressable>

                      {/* Unpaid Quarters */}
                      {isUnitExpanded && (
                        <View className="p-3">
                          {unit.unpaidQuarters
                            .sort((a, b) => {
                              if (a.year !== b.year) return a.year - b.year;
                              return a.quarter - b.quarter;
                            })
                            .map((quarter) => {
                              const isSelected = isQuarterSelected(
                                quarter.assessmentQuarterID,
                              );
                              const canSelect = canSelectQuarter(
                                unit.taxableUnitID,
                                quarter.year,
                                quarter.quarter,
                                unitQuarters,
                              );

                              const total =
                                quarter.dueAmount +
                                quarter.surchargeAmount -
                                quarter.discountAmount;

                              return (
                                <Pressable
                                  key={quarter.assessmentQuarterID}
                                  onPress={() =>
                                    handleQuarterToggle(
                                      quarter.assessmentQuarterID,
                                      unit.taxableUnitID,
                                      quarter.year,
                                      quarter.quarter,
                                    )
                                  }
                                  disabled={!isSelected && !canSelect}
                                  className={`flex-row items-center justify-between p-3 mb-2 rounded-lg border ${
                                    isSelected
                                      ? "bg-green-50 border-green-300"
                                      : !canSelect
                                        ? "bg-gray-100 border-gray-300 opacity-50"
                                        : "bg-white border-gray-300"
                                  }`}
                                >
                                  <View className="flex-row items-center flex-1">
                                    {/* Custom Checkbox */}
                                    <View
                                      className={`w-6 h-6 rounded border-2 items-center justify-center ${
                                        isSelected
                                          ? "bg-green-500 border-green-500"
                                          : !canSelect
                                            ? "bg-gray-300 border-gray-400"
                                            : "bg-white border-gray-400"
                                      }`}
                                    >
                                      {isSelected && (
                                        <Feather
                                          name="check"
                                          size={16}
                                          color="white"
                                        />
                                      )}
                                    </View>
                                    <View className="ml-3 flex-1">
                                      <Text
                                        className={`font-semibold ${
                                          isSelected
                                            ? "text-green-700"
                                            : "text-[#22577a]"
                                        }`}
                                      >
                                        Q{quarter.quarter} {quarter.year}
                                      </Text>
                                      <Text className="text-xs text-gray-600 mt-1">
                                        {quarter.paymentStatus}
                                      </Text>
                                    </View>
                                  </View>

                                  <View className="items-end">
                                    <Text
                                      className={`font-bold ${
                                        isSelected
                                          ? "text-green-700"
                                          : "text-[#22577a]"
                                      }`}
                                    >
                                      LKR {total.toFixed(2)}
                                    </Text>
                                    {quarter.surchargeAmount > 0 && (
                                      <Text className="text-xs text-red-600">
                                        +LKR{" "}
                                        {quarter.surchargeAmount.toFixed(2)}{" "}
                                        surcharge
                                      </Text>
                                    )}
                                    {quarter.discountAmount > 0 && (
                                      <Text className="text-xs text-green-600">
                                        -LKR {quarter.discountAmount.toFixed(2)}{" "}
                                        discount
                                      </Text>
                                    )}
                                  </View>
                                </Pressable>
                              );
                            })}
                        </View>
                      )}
                    </View>
                  );
                })}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
