import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function BudgetLayout() {
  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#2A9D8F",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: "Budget",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="category/[id]"
          options={{
            title: "Category Details",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="proposals/index"
          options={{
            title: "Community Ideas",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="proposals/wizard"
          options={{
            title: "Submit Your Idea",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="proposals/[id]"
          options={{
            title: "Proposal Details",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="impact/index"
          options={{
            title: "My Impact",
            headerShown: false,
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
