import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function ProjectLayout() {
  return (
    <SafeAreaProvider>
      {/* <Stack /> */}
      <Stack screenOptions={{ title: "Projects", headerShown: false }}>
        <Stack.Screen name="index" options={{ title: "Project Home" }} />
        <Stack.Screen name="road" options={{ title: "Road" }} />
        <Stack.Screen name="irrigation" options={{ title: "Irrigation" }} />
        <Stack.Screen name="construction" options={{ title: "Construction" }} />
        <Stack.Screen name="other" options={{ title: "Other" }} />
        <Stack.Screen
          name="projectDetail"
          options={{ title: "Project Detail" }}
        />
        <Stack.Screen
          name="project-tabs"
          options={{ title: "Project Tabs", headerShown: false }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
