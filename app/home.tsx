import { ROUTES } from "@/constants/routes";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { Button } from "react-native-paper";

export default function Index() {
  const router = useRouter();

  return (
    <View className="flex-1 justify-center items-center gap-6 bg-[#c7f9cc] px-4">
      {[
        // Button data for DRY formatting
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

      {/* Debug Button - Only show in development */}
      {__DEV__ && (
        <View className="flex justify-center items-center w-full rounded-xl shadow-md h-16 px-6 mt-4 bg-gray-800">
          <Button
            onPress={() => router.push("/debug")}
            style={{ width: "100%", height: "100%" }}
            contentStyle={{ height: "100%" }}
          >
            <View className="flex-row items-center justify-center gap-2">
              <MaterialCommunityIcons name="bug" size={24} color="#fbbf24" />
              <Text className="font-bold text-xl tracking-wide text-yellow-400">
                Debug Auth Store
              </Text>
            </View>
          </Button>
        </View>
      )}
    </View>
  );
}
