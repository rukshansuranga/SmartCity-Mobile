import { ROUTES } from "@/constants/routes";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

const menuItems = [
  {
    label: "Complains",
    route: ROUTES.COMPLAINS,
    icon: "alert-circle",
    color: "#EF4444",
  },
  {
    label: "Infrastructure",
    route: ROUTES.INFRASTRUCTURE,
    icon: "map-marker-radius",
    color: "#10B981",
  },
  { label: "News", route: ROUTES.NEWS, icon: "newspaper", color: "#F59E0B" },
  {
    label: "Projects",
    route: ROUTES.PROJECTS,
    icon: "office-building",
    color: "#3B82F6",
  },
  { label: "Tax", route: ROUTES.TAX, icon: "cash", color: "#8B5CF6" },
  {
    label: "Budget",
    route: ROUTES.BUDGET,
    icon: "cash-multiple",
    color: "#2A9D8F",
  },
  {
    label: "Adviser",
    route: ROUTES.ADVISER,
    icon: "account-tie",
    color: "#EC4899",
  },
  {
    label: "Profile",
    route: ROUTES.PROFILE,
    icon: "account",
    color: "#6366F1",
  },
];

export default function Index() {
  const router = useRouter();

  return (
    <ScrollView className="flex-1 bg-[#c7f9cc]">
      <View className="p-4">
        <View className="flex-row flex-wrap justify-between">
          {menuItems.map(({ label, route, icon, color }) => (
            <TouchableOpacity
              key={label}
              onPress={() => router.push(route as any)}
              className="w-[48%] mb-4 rounded-2xl shadow-lg overflow-hidden"
              style={{ backgroundColor: color }}
              activeOpacity={0.8}
            >
              <View className="items-center justify-center py-8 px-4">
                <MaterialCommunityIcons
                  name={icon as any}
                  size={48}
                  color="#ffffff"
                />
                <Text className="font-bold text-lg text-white mt-3 text-center">
                  {label}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Debug Button - Only show in development */}
        {__DEV__ && (
          <TouchableOpacity
            onPress={() => router.push("/debug")}
            className="w-full rounded-2xl shadow-lg overflow-hidden mt-2 bg-gray-800"
            activeOpacity={0.8}
          >
            <View className="flex-row items-center justify-center py-4 px-4 gap-2">
              <MaterialCommunityIcons name="bug" size={24} color="#fbbf24" />
              <Text className="font-bold text-lg text-yellow-400">
                Debug Auth Store
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}
