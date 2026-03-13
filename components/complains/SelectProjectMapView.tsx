import MapSearchBar from "@/components/infrastructure/MapSearchBar";
import ProjectMapView, {
  ProjectMapViewRef,
} from "@/components/projects/ProjectMapView";
import { ProjectWithComplainInfo } from "@/types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRef } from "react";
import { View } from "react-native";
import { Button, Text } from "react-native-paper";

interface SelectProjectMapViewProps {
  projects: ProjectWithComplainInfo[];
  selectedProject: ProjectWithComplainInfo | null;
  onProjectSelect: (project: ProjectWithComplainInfo) => void;
  onSwitchToList: () => void;
}

export default function SelectProjectMapView({
  projects,
  selectedProject,
  onProjectSelect,
  onSwitchToList,
}: SelectProjectMapViewProps) {
  const mapRef = useRef<ProjectMapViewRef>(null);

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

  return (
    <View className="flex-1">
      {projects.length === 0 ? (
        // Empty State
        <View className="flex-1 items-center justify-center bg-gray-100 rounded-lg mx-2">
          <MaterialCommunityIcons name="map-search" size={64} color="#CBD5E1" />
          <Text className="text-gray-500 text-lg mt-4">
            No projects to display
          </Text>
          <Text className="text-gray-400 text-sm mt-2 text-center px-4">
            Use the List View to search for projects first
          </Text>
          <Button
            mode="contained"
            onPress={onSwitchToList}
            className="mt-4"
            buttonColor="#22577a"
          >
            Switch to List View
          </Button>
        </View>
      ) : (
        // Map with Projects
        <View className="flex-1">
          <MapSearchBar
            onLocationSelected={handleLocationSearch}
            councilRadiusKm={10}
          />
          <ProjectMapView
            ref={mapRef}
            projects={projects}
            onProjectPress={onProjectSelect}
          />
        </View>
      )}
    </View>
  );
}
