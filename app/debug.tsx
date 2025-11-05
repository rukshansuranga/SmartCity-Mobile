import { DebugAuthStore } from "@/components/DebugAuthStore";
import { View } from "react-native";

export default function DebugScreen() {
  return (
    <View className="flex-1">
      <DebugAuthStore />
    </View>
  );
}
