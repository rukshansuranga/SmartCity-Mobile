import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function GarbageLayout() {
  return (
    <SafeAreaProvider>
      {/* <Stack /> */}
      <Stack screenOptions={{ title: "Garbage" }}>
        <Stack.Screen name="garbage" options={{ title: "Tracking" }} />
        <Stack.Screen name="shedule" options={{ title: "Shedule" }} />
      </Stack>
    </SafeAreaProvider>
  );
}
