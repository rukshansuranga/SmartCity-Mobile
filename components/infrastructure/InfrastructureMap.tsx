import { ASSET_COLORS } from "@/config/assetConfig";
import { useAuthStore } from "@/stores/authStore";
import { InfrastructureAsset } from "@/types/infrastructure";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import MapView, {
  Marker,
  Polygon,
  PROVIDER_GOOGLE,
  Region,
} from "react-native-maps";

interface Props {
  assets: InfrastructureAsset[];
  onAssetPress: (asset: InfrastructureAsset) => void;
  onRegionChange?: (bounds: {
    minLat: number;
    minLng: number;
    maxLat: number;
    maxLng: number;
  }) => void;
  initialRegion?: Region;
  loading?: boolean;
  selectedAsset?: InfrastructureAsset | null;
}

export interface InfrastructureMapRef {
  animateToRegion: (region: Region, duration?: number) => void;
}

//Custom marker component for different asset types
// const CustomMarker: React.FC<{
//   asset: InfrastructureAsset;
//   isSelected: boolean;
// }> = React.memo(({ asset, isSelected }) => {
//   const iconConfig = ASSET_ICON_CONFIG[asset.assetType] || {
//     family: "MaterialCommunityIcons",
//     name: "map-marker",
//   };
//   const color = ASSET_COLORS[asset.assetType] || "#22C55E";

//   console.log(
//     "color",
//     color,
//     "iconConfig",
//     iconConfig,
//     "assetType",
//     asset.assetType,
//   );

//   return (
//     <View style={styles.markerContainer}>
//       <View style={{ width: 40, height: 40, backgroundColor: "yellow" }}></View>
//     </View>
//   );
// });

// CustomMarker.displayName = "CustomMarker";

interface CustomMarkerProps {
  asset: any;
  isSelected: boolean;
}

const CustomMarker = React.memo<CustomMarkerProps>(({ asset, isSelected }) => {
  const brandGreen = ASSET_COLORS[asset.assetType] || "#22C55E";

  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      {/* Main Green Circle */}
      <View
        style={{
          width: 25,
          height: 25,
          borderRadius: 23,
          backgroundColor: isSelected ? "#FFFFFF" : brandGreen,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 2,
          borderColor: isSelected ? brandGreen : "#FFFFFF",
          // Shadow for iOS
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          // Elevation for Android
          elevation: 5,
        }}
      >
        <MaterialCommunityIcons
          name="map-marker-outline" // Change this based on your asset logic
          size={20}
          color={isSelected ? brandGreen : "white"}
        />
      </View>

      {/* Pointer Triangle */}
      <View
        style={{
          width: 0,
          height: 0,
          backgroundColor: "transparent",
          borderStyle: "solid",
          borderLeftWidth: 8,
          borderRightWidth: 8,
          borderTopWidth: 10,
          borderLeftColor: "transparent",
          borderRightColor: "transparent",
          borderTopColor: isSelected ? "#FFFFFF" : brandGreen,
          marginTop: -2,
        }}
      />
    </View>
  );
});

CustomMarker.displayName = "CustomMarker";

const InfrastructureMap = forwardRef<InfrastructureMapRef, Props>(
  (
    {
      assets,
      onAssetPress,
      onRegionChange,
      initialRegion,
      loading = false,
      selectedAsset,
    },
    ref,
  ) => {
    const mapRef = useRef<MapView>(null);

    // Expose map methods to parent
    useImperativeHandle(ref, () => ({
      animateToRegion: (region: Region, duration = 500) => {
        mapRef.current?.animateToRegion(region, duration);
      },
    }));
    const { selectedCouncil } = useAuthStore();
    const [trackedMarkers, setTrackedMarkers] = useState<Set<string>>(
      new Set(),
    );

    const [region, setRegion] = useState<Region>(
      initialRegion || {
        latitude: selectedCouncil?.latitude ?? 7.8731,
        longitude: selectedCouncil?.longitude ?? 80.7718,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      },
    );

    // Update region when initialRegion prop changes
    useEffect(() => {
      if (initialRegion) {
        setRegion(initialRegion);
        // Animate map to new region
        mapRef.current?.animateToRegion(initialRegion, 500);
      }
    }, [initialRegion]);

    // Track view changes for selected asset and newly loaded assets
    useEffect(() => {
      const newTracked = new Set<string>();

      // Track selected asset
      if (selectedAsset) {
        newTracked.add(selectedAsset.assetId.toString());
      }

      // Track all assets briefly on initial load or when assets change
      if (assets && assets.length > 0) {
        assets.forEach((asset) => {
          newTracked.add(asset.assetId.toString());
        });
      }

      setTrackedMarkers(newTracked);

      // Stop tracking after markers have rendered
      const timer = setTimeout(() => {
        const selectedOnly = new Set<string>();
        if (selectedAsset) {
          selectedOnly.add(selectedAsset.assetId.toString());
        }
        setTrackedMarkers(selectedOnly);
      }, 1500);

      return () => clearTimeout(timer);
    }, [selectedAsset, assets]);

    const handleRegionChangeComplete = useCallback(
      async (newRegion: Region) => {
        setRegion(newRegion);

        if (onRegionChange) {
          // Calculate bounds from region
          const latDelta = newRegion.latitudeDelta;
          const lngDelta = newRegion.longitudeDelta;

          const bounds = {
            minLat: newRegion.latitude - latDelta / 2,
            maxLat: newRegion.latitude + latDelta / 2,
            minLng: newRegion.longitude - lngDelta / 2,
            maxLng: newRegion.longitude + lngDelta / 2,
          };

          onRegionChange(bounds);
        }
      },
      [onRegionChange],
    );

    // Separate assets by geometry type (with safety check)
    const safeAssets = assets || [];
    const pointAssets = safeAssets.filter((a) => a.geometryType === "Point");
    const polygonAssets = safeAssets.filter(
      (a) => a.geometryType === "Polygon",
    );

    return (
      <View style={styles.container}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={region}
          onRegionChangeComplete={handleRegionChangeComplete}
          onMarkerPress={(event) => {
            const markerId = event.nativeEvent.id;
            const asset = safeAssets.find(
              (a) => a.assetId.toString() === markerId,
            );
            if (asset) {
              onAssetPress(asset);
            }
          }}
          showsUserLocation
          showsMyLocationButton
          provider={PROVIDER_GOOGLE}
        >
          {/* Point markers */}
          {pointAssets.map((asset) => {
            if (asset.geometryType !== "Point") return null;

            const isSelected = selectedAsset?.assetId === asset.assetId;
            const location = asset.location as {
              latitude: number;
              longitude: number;
            };
            const shouldTrackChanges = trackedMarkers.has(
              asset.assetId.toString(),
            );

            return (
              <Marker
                key={asset.assetId}
                identifier={asset.assetId.toString()}
                coordinate={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                }}
                opacity={isSelected ? 1 : 0.8}
                zIndex={isSelected ? 1000 : 0}
                tracksViewChanges={shouldTrackChanges}
              >
                <CustomMarker asset={asset} isSelected={isSelected} />
              </Marker>
            );
          })}

          {/* Polygon markers */}
          {polygonAssets.map((asset) => {
            if (asset.geometryType !== "Polygon") return null;

            const isSelected = selectedAsset?.assetId === asset.assetId;
            const location = asset.location as {
              coordinates: { latitude: number; longitude: number }[];
            };
            const coordinates = location.coordinates.map((coord) => ({
              latitude: coord.latitude,
              longitude: coord.longitude,
            }));

            return (
              <Polygon
                key={asset.assetId}
                coordinates={coordinates}
                fillColor={`${ASSET_COLORS[asset.assetType]}40`}
                strokeColor={ASSET_COLORS[asset.assetType]}
                strokeWidth={isSelected ? 3 : 2}
                tappable
                onPress={() => onAssetPress(asset)}
                zIndex={isSelected ? 1000 : 0}
              />
            );
          })}
        </MapView>

        {/* Loading indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#22C55E" />
              <Text style={styles.loadingText}>Loading assets...</Text>
            </View>
          </View>
        )}

        {/* Asset count badge */}
        <View style={styles.countBadge}>
          <Text style={styles.countText}>
            {safeAssets.length} asset{safeAssets.length !== 1 ? "s" : ""}
          </Text>
        </View>
      </View>
    );
  },
);

InfrastructureMap.displayName = "InfrastructureMap";

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 70,
    height: 70,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  markerTriangle: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    marginTop: -2,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
  },
  loadingBox: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#374151",
  },
  countBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  countText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
});

export default InfrastructureMap;
