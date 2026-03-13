import { Stack } from "expo-router";

export default function InfrastructureLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Infrastructure",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="map/[type]"
        options={{
          title: "Asset Map",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="detail/[assetId]"
        options={{
          title: "Asset Details",
          headerShown: false,
        }}
      />
    </Stack>
  );
}
