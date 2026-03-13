import { getAssetsByBounds } from "@/api/infrastructureAction";
import AssetPreviewSheet from "@/components/infrastructure/AssetPreviewSheet";
import InfrastructureMap, {
  InfrastructureMapRef,
} from "@/components/infrastructure/InfrastructureMap";
import { ASSET_COLORS, ASSET_TYPE_NAMES } from "@/config/assetConfig";
import { useAuthStore } from "@/stores/authStore";
import {
  InfrastructureAsset,
  getAssetTypeFromValue,
} from "@/types/infrastructure";
import { MaterialIcons } from "@expo/vector-icons";
import BottomSheet from "@gorhom/bottom-sheet";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import MapSearchBar from "../../../components/infrastructure/MapSearchBar";

export default function InfrastructureMapScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { selectedCouncil } = useAuthStore();
  const fromComplains = params.fromComplains === "true";

  const bottomSheetRef = useRef<BottomSheet>(null);
  const mapRef = useRef<InfrastructureMapRef>(null);
  const isMarkerPressRef = useRef(false);

  const [assets, setAssets] = useState<InfrastructureAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAsset, setSelectedAsset] =
    useState<InfrastructureAsset | null>(null);

  const assetType = params.type
    ? getAssetTypeFromValue(parseInt(params.type as string))
    : undefined;

  // Initial region from selected council
  const initialRegion = useMemo(
    () =>
      selectedCouncil
        ? {
            latitude:
              typeof selectedCouncil.latitude === "number"
                ? selectedCouncil.latitude
                : parseFloat(selectedCouncil.latitude || "7.8731"),
            longitude:
              typeof selectedCouncil.longitude === "number"
                ? selectedCouncil.longitude
                : parseFloat(selectedCouncil.longitude || "80.7718"),
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }
        : undefined,
    [selectedCouncil],
  );

  const loadAssets = useCallback(
    async (bounds: {
      minLat: number;
      minLng: number;
      maxLat: number;
      maxLng: number;
    }) => {
      try {
        setLoading(true);
        const result = await getAssetsByBounds({
          ...bounds,
          assetType,
        });

        if (result.isSuccess && result.data) {
          setAssets(result.data);
        } else {
          console.error("Failed to load assets:", result.message);
        }
      } catch (error) {
        console.error("Error loading assets:", error);
      } finally {
        setLoading(false);
      }
    },
    [assetType],
  );

  // Load initial assets
  useEffect(() => {
    if (initialRegion) {
      loadAssets({
        minLat: initialRegion.latitude - initialRegion.latitudeDelta / 2,
        maxLat: initialRegion.latitude + initialRegion.latitudeDelta / 2,
        minLng: initialRegion.longitude - initialRegion.longitudeDelta / 2,
        maxLng: initialRegion.longitude + initialRegion.longitudeDelta / 2,
      });
    }
  }, [initialRegion, loadAssets]);

  const handleRegionChange = useCallback(
    (bounds: {
      minLat: number;
      minLng: number;
      maxLat: number;
      maxLng: number;
    }) => {
      // Skip loading if a marker was just pressed
      if (isMarkerPressRef.current) {
        return;
      }
      loadAssets(bounds);
    },
    [loadAssets],
  );

  const handleAssetPress = (asset: InfrastructureAsset) => {
    isMarkerPressRef.current = true;

    if (fromComplains) {
      // Coming from complains: Navigate directly to asset detail screen
      console.log(
        "From complains - navigating to asset detail:",
        asset.assetId,
      );
      router.push({
        pathname: "/(infrastructure)/detail/[assetId]",
        params: { assetId: asset.assetId },
      });
    } else {
      // Coming from infrastructure: Show bottom sheet
      console.log("From infrastructure - showing bottom sheet:", asset.assetId);
      setSelectedAsset(asset);
      bottomSheetRef.current?.snapToIndex(0);
    }

    // Reset the flag after a short delay to ensure it catches the region change
    setTimeout(() => {
      isMarkerPressRef.current = false;
    }, 500);
  };

  const handleViewDetails = () => {
    if (!selectedAsset) return;
    bottomSheetRef.current?.close();
    router.push({
      pathname: "/(infrastructure)/detail/[assetId]",
      params: { assetId: selectedAsset.assetId },
    });
  };

  const handleReportIssue = () => {
    if (!selectedAsset) return;
    bottomSheetRef.current?.close();
    router.push({
      pathname: "/(complains)/infrastructure/create/[assetId]",
      params: { assetId: selectedAsset.assetId },
    });
  };

  const handleLocationSearch = (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    console.log("Search result:", location);
    // Animate map to searched location
    mapRef.current?.animateToRegion(
      {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      500,
    );
  };

  const assetTypeName =
    assetType !== undefined
      ? ASSET_TYPE_NAMES[assetType]
      : "All Infrastructure";

  const headerColor =
    assetType !== undefined ? ASSET_COLORS[assetType] : "#22C55E";

  // Don't render until we have valid initialRegion
  if (!initialRegion) {
    return (
      <SafeAreaProvider>
        <SafeAreaView className="flex-1 bg-white justify-center items-center">
          <Text>Loading map...</Text>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-white">
        {/* Header */}
        <View style={[styles.header, { backgroundColor: headerColor }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{assetTypeName}</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Search Bar */}
        <MapSearchBar
          onLocationSelected={handleLocationSearch}
          councilRadiusKm={10}
        />

        {/* Map */}
        <InfrastructureMap
          ref={mapRef}
          assets={assets}
          onAssetPress={handleAssetPress}
          onRegionChange={handleRegionChange}
          initialRegion={initialRegion}
          loading={loading}
          selectedAsset={selectedAsset}
        />

        {/* Asset Preview Bottom Sheet */}
        <AssetPreviewSheet
          asset={selectedAsset}
          bottomSheetRef={bottomSheetRef}
          onViewDetails={handleViewDetails}
          onReportIssue={handleReportIssue}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  headerSpacer: {
    width: 32,
  },
});
