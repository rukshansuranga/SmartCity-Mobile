import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { Text } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";

const initialRegion = {
  latitude: 7.028372283362622,
  longitude: 80.02045957272463,
  latitudeDelta: 0.043,
  longitudeDelta: 0.034,
};

export default function Garbage() {
  const [inputDate, setInputDate] = useState("2025-07-10");
  const [region, setRegion] = useState(undefined);
  const [coordinates, setCoordinates] = useState([]);

  const [regions, setRegions] = useState([]);

  useEffect(() => {
    fetchRegions();
  }, []);

  useEffect(() => {
    if (region) {
      fetchRideDataPoints();
    }

    // Set up interval for periodic calls
    const intervalId = setInterval(() => {
      if (region) {
        fetchRideDataPoints();
      }
    }, 1000 * 60);

    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [region]);

  async function fetchRideDataPoints() {
    console.log("select region", region);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/route?regionNo=${region}&date=${inputDate}`
      );

      const data = await response.json();

      // Handle new ApiResponse structure
      if (data && typeof data === "object" && "isSuccess" in data) {
        if (!data.isSuccess) {
          console.error("Fetching ride data failed:", data.message);
          if (data.errors && data.errors.length > 0) {
            data.errors.forEach((error) => console.error(error));
          }
          setCoordinates([]);
          return;
        }
        console.log("ride points", data.data?.ridePoints);
        setCoordinates(data.data?.ridePoints || []);
      } else {
        // For backwards compatibility
        console.log("ride points", data?.ridePoints);
        setCoordinates(data?.ridePoints || []);
      }
    } catch (error) {
      console.error("Error fetching ride data:", error);
      setCoordinates([]);
    }
  }

  async function fetchRegions() {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/region`
      );

      const data = await response.json();

      // Handle new ApiResponse structure
      if (data && typeof data === "object" && "isSuccess" in data) {
        if (!data.isSuccess) {
          console.error("Fetching regions failed:", data.message);
          if (data.errors && data.errors.length > 0) {
            data.errors.forEach((error) => console.error(error));
          }
          setRegions([]);
          return;
        }
        setRegions(data.data || []);
      } else {
        // For backwards compatibility
        setRegions(data || []);
      }
    } catch (error) {
      console.error("Error fetching regions:", error);
      setRegions([]);
    }
  }

  return (
    <SafeAreaProvider>
      <View className="flex-1 justify-start items-center gap-5 p-2">
        <View className="w-full">
          <Picker
            selectedValue={region}
            onValueChange={(itemValue, itemIndex) => setRegion(itemValue)}
          >
            {regions?.map((region) => (
              <Picker.Item
                key={region.regionNo}
                label={region.name}
                value={region.regionNo}
              />
            ))}
          </Picker>
        </View>

        <View className="flex-1 w-full">
          <MapView
            style={{ flex: 1 }}
            initialRegion={{
              latitude: 7.028372283362622,
              longitude: 80.02045957272463,
              latitudeDelta: 0.043,
              longitudeDelta: 0.034,
            }}
            provider={PROVIDER_GOOGLE}
          >
            {coordinates && coordinates.length > 1 && (
              <>
                {/* <Marker coordinate={coordinates[0]} />
                <Marker coordinate={coordinates[coordinates.length - 1]} /> */}
                {/* <Polyline
                  coordinates={coordinates}
                  strokeColor="#000"
                  strokeColors={["#7F0000"]}
                  strokeWidth={6}
                /> */}
                <MapViewDirections
                  origin={coordinates[0]}
                  waypoints={coordinates.slice(1, coordinates.length - 2)}
                  destination={coordinates[coordinates.length - 1]}
                  apikey="AIzaSyBO2E_KAoN9H3bmeXlS9Np20qGmtlg-qbc"
                  strokeWidth={3}
                  strokeColor="hotpink"
                  mode="WALKING"
                />
              </>
            )}
          </MapView>
        </View>
        <Text>Tracking</Text>
      </View>
    </SafeAreaProvider>
  );
}
