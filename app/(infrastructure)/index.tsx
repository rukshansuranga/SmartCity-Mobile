import { getAssetCounts } from "@/api/infrastructureAction";
import AssetCategoryGrid from "@/components/infrastructure/AssetCategoryGrid";
import { ASSET_TYPE_NAMES } from "@/config/assetConfig";
import { AssetType } from "@/types/infrastructure";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, SafeAreaView, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function InfrastructureIndex() {
  const router = useRouter();
  const [counts, setCounts] = useState<Record<number, number> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCounts();
  }, []);

  const loadCounts = async () => {
    try {
      const result = await getAssetCounts();
      if (result.isSuccess && result.data) {
        setCounts(result.data as any);
      }
    } catch (error) {
      console.error("Error loading asset counts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryPress = (assetType: AssetType) => {
    router.push({
      pathname: "/(infrastructure)/map/[type]",
      params: { type: assetType.toString() },
    });
  };

  const categories = [
    {
      type: AssetType.Library,
      label: ASSET_TYPE_NAMES[AssetType.Library],
      count: counts?.[AssetType.Library],
    },
    {
      type: AssetType.Playground,
      label: ASSET_TYPE_NAMES[AssetType.Playground],
      count: counts?.[AssetType.Playground],
    },
    {
      type: AssetType.Streetlight,
      label: ASSET_TYPE_NAMES[AssetType.Streetlight],
      count: counts?.[AssetType.Streetlight],
    },
    {
      type: AssetType.BusStop,
      label: ASSET_TYPE_NAMES[AssetType.BusStop],
      count: counts?.[AssetType.BusStop],
    },
    {
      type: AssetType.Park,
      label: ASSET_TYPE_NAMES[AssetType.Park],
      count: counts?.[AssetType.Park],
    },
    {
      type: AssetType.Bin,
      label: ASSET_TYPE_NAMES[AssetType.Bin],
      count: counts?.[AssetType.Bin],
    },
  ];

  if (loading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView className="flex-1 bg-[#c7f9cc] justify-center items-center">
          <ActivityIndicator size="large" color="#22C55E" />
          <Text className="mt-4 text-[#22577a]">Loading infrastructure...</Text>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-[#c7f9cc]">
        <View className="p-4">
          <Text className="text-2xl font-bold text-[#22577a] mb-2">
            Infrastructure Assets
          </Text>
          <Text className="text-base text-[#6B7280] mb-4">
            View and report issues with community infrastructure
          </Text>
        </View>
        <AssetCategoryGrid
          categories={categories}
          onCategoryPress={handleCategoryPress}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
