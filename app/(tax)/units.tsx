import LandParcelTable from "@/components/tax/LandParcelTable";
import { ScrollView, Text, View } from "react-native";
import { useAuthStore } from "../../stores/authStore";

export default function UnitsScreen() {
  const { userInfo } = useAuthStore();
  const residentId = userInfo?.sub; // Replace with actual resident ID

  if (!residentId) {
    return (
      <View>
        <Text className="text-lg text-gray-800">Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-[#c7f9cc]">
      <View className="p-4">
        <LandParcelTable residentId={residentId} />
      </View>
    </ScrollView>
  );
}
