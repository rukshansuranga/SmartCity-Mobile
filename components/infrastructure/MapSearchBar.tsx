import { useAuthStore } from "@/stores/authStore";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface MapSearchBarProps {
  onLocationSelected: (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;
  councilRadiusKm?: number;
}

const GOOGLE_PLACES_API_KEY = "AIzaSyBhGqSnEKPcWQAEvDoImRCoq-yyi4E7fo4";

// Calculate distance between two points using Haversine formula
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  return distance;
};

const MapSearchBar: React.FC<MapSearchBarProps> = ({
  onLocationSelected,
  councilRadiusKm = 10,
}) => {
  const { selectedCouncil } = useAuthStore();
  const [searchText, setSearchText] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  if (!selectedCouncil) {
    return null;
  }

  const handleSearch = async () => {
    if (!searchText.trim()) {
      Alert.alert("Error", "Please enter a location to search");
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchText)}&components=country:LK&key=${GOOGLE_PLACES_API_KEY}`,
      );
      const data = await response.json();

      if (data.status === "OK" && data.results?.length > 0) {
        const result = data.results[0];
        const location = result.geometry?.location;

        if (location) {
          // Get council coordinates
          const councilLat =
            typeof selectedCouncil.latitude === "number"
              ? selectedCouncil.latitude
              : parseFloat(selectedCouncil.latitude || "0");
          const councilLng =
            typeof selectedCouncil.longitude === "number"
              ? selectedCouncil.longitude
              : parseFloat(selectedCouncil.longitude || "0");

          // Calculate distance from council center
          const distance = calculateDistance(
            councilLat,
            councilLng,
            location.lat,
            location.lng,
          );

          // Check if location is within radius
          if (distance > councilRadiusKm) {
            Alert.alert(
              "Location Too Far",
              `The searched location is ${distance.toFixed(1)} km away from your council area. Please search for locations within ${councilRadiusKm} km radius.`,
            );
            return;
          }

          onLocationSelected({
            latitude: location.lat,
            longitude: location.lng,
            address: result.formatted_address,
          });
          setSearchText("");
        }
      } else {
        Alert.alert(
          "Not Found",
          "Could not find the location. Try another search term.",
        );
      }
    } catch (error) {
      console.error("Search error:", error);
      Alert.alert("Error", "Failed to search location");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <View style={styles.searchContainer}>
      <View style={styles.searchBar}>
        <MaterialIcons
          name="search"
          size={20}
          color="#666"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.input}
          placeholder="Search location..."
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          editable={!isSearching}
        />
        {searchText.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchText("")}
            style={styles.clearButton}
          >
            <MaterialIcons name="clear" size={20} color="#666" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={handleSearch}
          style={styles.searchButton}
          disabled={isSearching || !searchText.trim()}
        >
          <MaterialIcons
            name="arrow-forward"
            size={20}
            color={isSearching || !searchText.trim() ? "#ccc" : "#22C55E"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    paddingHorizontal: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    paddingVertical: 8,
  },
  clearButton: {
    padding: 4,
    marginRight: 4,
  },
  searchButton: {
    padding: 4,
  },
});

export default MapSearchBar;
