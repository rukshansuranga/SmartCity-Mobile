import { getProjectComplainsByProjectId } from "@/api/complainAction";
import { useAuthStore } from "@/stores/authStore";
import { Project, ProjectWithComplainInfo } from "@/types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";

interface Props {
  projects: Project[];
  onProjectPress: (project: ProjectWithComplainInfo) => void;
  loading?: boolean;
}

export interface ProjectMapViewRef {
  animateToRegion: (region: Region, duration?: number) => void;
}

interface MarkerColor {
  main: string;
  border: string;
  icon: string;
}

const getMarkerColor = (
  complainCount: number,
  hasUserComplained: boolean,
): MarkerColor => {
  if (hasUserComplained) {
    // Red - User already complained
    return { main: "#EF4444", border: "#DC2626", icon: "white" };
  } else if (complainCount > 0) {
    // Yellow - Has complains
    return { main: "#F59E0B", border: "#D97706", icon: "white" };
  } else {
    // Green - No complains
    return { main: "#22C55E", border: "#16A34A", icon: "white" };
  }
};

const CustomMarker: React.FC<{
  complainCount: number;
  hasUserComplained: boolean;
  isSelected: boolean;
}> = ({ complainCount, hasUserComplained, isSelected }) => {
  const colors = getMarkerColor(complainCount, hasUserComplained);

  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      {/* Badge for complain count */}
      {complainCount > 0 && (
        <View
          style={{
            position: "absolute",
            top: -8,
            right: -8,
            backgroundColor: "#DC2626",
            borderRadius: 10,
            minWidth: 20,
            height: 20,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 4,
            zIndex: 10,
            borderWidth: 2,
            borderColor: "#fff",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 10, fontWeight: "bold" }}>
            {complainCount}
          </Text>
        </View>
      )}

      {/* Main Marker Circle */}
      <View
        style={{
          width: 25,
          height: 25,
          borderRadius: 23,
          backgroundColor: isSelected ? "#FFFFFF" : colors.main,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 2,
          borderColor: isSelected ? colors.main : "#FFFFFF",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
      >
        <MaterialCommunityIcons
          name="office-building"
          size={20}
          color={isSelected ? colors.main : colors.icon}
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
          borderTopColor: isSelected ? "#FFFFFF" : colors.main,
          marginTop: -2,
        }}
      />
    </View>
  );
};

// Helper function to extract coordinates from GeoJSON
const extractCoordinates = (
  geoJsonGeometry?: string,
): { latitude: number; longitude: number } | null => {
  if (!geoJsonGeometry) return null;

  try {
    const geoJson = JSON.parse(geoJsonGeometry);
    let coordinates: number[] | null = null;

    if (geoJson.type === "Feature" && geoJson.geometry) {
      // Handle Feature wrapper
      const geometry = geoJson.geometry;
      if (geometry.type === "Point") {
        coordinates = geometry.coordinates;
      } else if (
        geometry.type === "LineString" ||
        geometry.type === "Polygon"
      ) {
        // For LineString or Polygon, use the first coordinate
        coordinates = geometry.coordinates[0];
      }
    } else if (geoJson.type === "Point") {
      // Direct geometry object
      coordinates = geoJson.coordinates;
    } else if (geoJson.type === "LineString" || geoJson.type === "Polygon") {
      coordinates = geoJson.coordinates[0];
    }

    if (coordinates && coordinates.length >= 2) {
      // GeoJSON uses [longitude, latitude]
      return {
        longitude: coordinates[0],
        latitude: coordinates[1],
      };
    }
  } catch (error) {
    console.error("Error parsing GeoJSON:", error);
  }

  return null;
};

const ProjectMapView = forwardRef<ProjectMapViewRef, Props>(
  ({ projects, onProjectPress, loading = false }, ref) => {
    const { selectedCouncil, userInfo } = useAuthStore();
    const mapRef = useRef<MapView>(null);
    const isMountedRef = useRef(true);
    const [projectsWithComplains, setProjectsWithComplains] = useState<
      ProjectWithComplainInfo[]
    >([]);
    const [loadingComplains, setLoadingComplains] = useState(false);

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
          : {
              latitude: 7.8731,
              longitude: 80.7718,
              latitudeDelta: 0.1,
              longitudeDelta: 0.1,
            },
      [selectedCouncil],
    );

    // Fetch complain counts for all projects
    const fetchComplainCounts = useCallback(async () => {
      if (!projects || projects.length === 0) return;

      if (isMountedRef.current) {
        setLoadingComplains(true);
      }

      try {
        const projectsWithInfo: ProjectWithComplainInfo[] = await Promise.all(
          projects.map(async (project) => {
            try {
              const response = await getProjectComplainsByProjectId(
                project.projectId,
              );
              const complains = response.isSuccess ? response.data : [];
              const hasUserComplained = complains.some(
                (c) => c.residentId === userInfo?.sub,
              );

              return {
                ...project,
                complainCount: complains.length,
                hasUserComplained,
              };
            } catch (error) {
              console.error(
                `Error fetching complains for project ${project.projectId}:`,
                error,
              );
              return {
                ...project,
                complainCount: 0,
                hasUserComplained: false,
              };
            }
          }),
        );

        if (isMountedRef.current) {
          setProjectsWithComplains(projectsWithInfo);
        }
      } catch (error) {
        console.error("Error fetching complain counts:", error);
      } finally {
        if (isMountedRef.current) {
          setLoadingComplains(false);
        }
      }
    }, [projects, userInfo?.sub]);

    useEffect(() => {
      isMountedRef.current = true;

      fetchComplainCounts();

      return () => {
        isMountedRef.current = false;
      };
    }, [fetchComplainCounts]);

    // Fit map to show all markers
    useEffect(() => {
      if (projectsWithComplains.length > 0 && mapRef.current) {
        const coordinates = projectsWithComplains
          .map((p) => extractCoordinates(p.geoJsonGeometry))
          .filter(
            (coord): coord is { latitude: number; longitude: number } =>
              coord !== null,
          );

        if (coordinates.length > 0) {
          const timer = setTimeout(() => {
            if (isMountedRef.current) {
              mapRef.current?.fitToCoordinates(coordinates, {
                edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                animated: true,
              });
            }
          }, 500);

          return () => clearTimeout(timer);
        }
      }
    }, [projectsWithComplains]);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      animateToRegion: (region: Region, duration: number = 500) => {
        mapRef.current?.animateToRegion(region, duration);
      },
    }));

    const handleMarkerPress = (project: ProjectWithComplainInfo) => {
      onProjectPress(project);
    };

    return (
      <View style={styles.container}>
        {(loading || loadingComplains) && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#22577a" />
            <Text style={styles.loadingText}>
              {loading ? "Loading projects..." : "Loading complain data..."}
            </Text>
          </View>
        )}

        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={initialRegion}
          showsUserLocation
          showsMyLocationButton
          provider={PROVIDER_GOOGLE}
        >
          {projectsWithComplains
            .map((project) => {
              const coords = extractCoordinates(project.geoJsonGeometry);
              if (!coords) return null;

              return (
                <Marker
                  key={project.projectId}
                  coordinate={coords}
                  onPress={() => handleMarkerPress(project)}
                >
                  <CustomMarker
                    complainCount={project.complainCount || 0}
                    hasUserComplained={project.hasUserComplained || false}
                    isSelected={false}
                  />
                </Marker>
              );
            })
            .filter((marker) => marker !== null)}
        </MapView>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#22C55E" }]} />
            <Text style={styles.legendText}>No complains</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#F59E0B" }]} />
            <Text style={styles.legendText}>Has complains</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#EF4444" }]} />
            <Text style={styles.legendText}>You complained</Text>
          </View>
        </View>
      </View>
    );
  },
);

ProjectMapView.displayName = "ProjectMapView";

export default ProjectMapView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#22577a",
  },
  legend: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 8,
    borderRadius: 8,
    gap: 4,
    elevation: 4,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 11,
    color: "#333",
  },
});
