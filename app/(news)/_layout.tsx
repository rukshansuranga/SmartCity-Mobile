import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function NewsLayout() {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ title: "News", headerShown: false }}>
        <Stack.Screen name="index" options={{ title: "News Feed" }} />
        <Stack.Screen
          name="newsDetail"
          options={{ title: "News Detail", headerShown: true }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
