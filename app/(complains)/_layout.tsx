// prettier-ignore-start
import "react-native-get-random-values";
// prettier-ignore-end

import "@/global.css";
import { Stack } from "expo-router";

export default function ComplainLayout() {
  return (
    <Stack screenOptions={{ title: "Complains", headerShown: false }}>
      {/* <Stack.Screen name="complains" options={{ title: "Complains" }} /> */}
      <Stack.Screen
        name="general/GeneralComplainList"
        options={{ title: "General Complains" }}
      />
      <Stack.Screen
        name="general/AddGeneralComplain"
        options={{ title: "Add General Complains" }}
      />

      <Stack.Screen
        name="lightpost/LightPostComplainList"
        options={{ title: "Light Post Complains" }}
      />
    </Stack>
  );
}
