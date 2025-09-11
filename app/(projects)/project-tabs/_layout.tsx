import { MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function ProjectTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#22577a",
        tabBarInactiveTintColor: "#666",
        tabBarStyle: {
          backgroundColor: "#c7f9cc",
          borderTopColor: "#80ed99",
          borderTopWidth: 1,
        },
        headerStyle: {
          backgroundColor: "#c7f9cc",
        },
        headerTintColor: "#22577a",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Tabs.Screen
        name="project-details"
        options={{
          title: "Project Details",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="info" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="project-progress"
        options={{
          title: "Progress",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="trending-up" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="feedback"
        options={{
          title: "Feedback",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="feedback" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="complains"
        options={{
          title: "Complains",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="report-problem" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
