// Example of adding Council Switcher to home screen
// Add this to app/home.tsx

import CouncilSwitcher from "@/components/CouncilSwitcher";
import { ROUTES } from "@/constants/routes";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";
import { Button, IconButton } from "react-native-paper";

export default function Index() {
  const router = useRouter();
  const { selectedCouncil } = useAuthStore();
  const [showCouncilSwitcher, setShowCouncilSwitcher] = useState(false);

  return (
    <View className="flex-1 bg-[#c7f9cc]">
      {/* Council Info Header */}
      <View className="bg-[#38a3a5] p-4 flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-white text-sm font-semibold">
            Current Council
          </Text>
          <Text className="text-white text-lg font-bold">
            {selectedCouncil?.label || "Not Selected"}
          </Text>
        </View>
        <IconButton
          icon="swap-horizontal"
          iconColor="white"
          size={24}
          onPress={() => setShowCouncilSwitcher(true)}
          style={{ backgroundColor: "#57cc99" }}
        />
      </View>

      {/* Existing buttons */}
      <View className="flex-1 justify-center items-center gap-6 px-4">
        {[
          { label: "Complains", route: ROUTES.COMPLAINS },
          { label: "Garbage", route: ROUTES.GARBAGE },
          { label: "Projects", route: ROUTES.PROJECTS },
          { label: "Tax", route: ROUTES.TAX },
          { label: "Adviser", route: ROUTES.ADVISER },
          { label: "Profile", route: ROUTES.PROFILE },
        ].map(({ label, route }, idx) => (
          <View
            key={label}
            className="flex justify-center items-center w-full rounded-xl shadow-md h-20 px-6"
            style={{ backgroundColor: idx % 2 === 0 ? "#80ed99" : "#57cc99" }}
          >
            <Button
              onPress={() => router.push(route as any)}
              style={{ width: "100%", height: "100%" }}
              contentStyle={{ height: "100%" }}
            >
              <Text className="font-bold text-3xl tracking-wide text-center w-full text-[#22577a]">
                {label}
              </Text>
            </Button>
          </View>
        ))}
      </View>

      {/* Council Switcher Modal */}
      <CouncilSwitcher
        visible={showCouncilSwitcher}
        onDismiss={() => setShowCouncilSwitcher(false)}
      />
    </View>
  );
}
