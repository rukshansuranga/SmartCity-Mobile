import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { Button } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function Index() {
  const router = useRouter();

  const projectTypes = [
    {
      label: "Road",
      route: "/projectList?projectType=Road",
      color: "#4A5568",
      icon: "road-variant" as const,
      textColor: "#FFFFFF",
    },
    {
      label: "Irrigation",
      route: "/projectList?projectType=Irrigation",
      color: "#3182CE",
      icon: "water" as const,
      textColor: "#FFFFFF",
    },
    {
      label: "Construction",
      route: "/projectList?projectType=Construction",
      color: "#F59E0B",
      icon: "hammer-wrench" as const,
      textColor: "#FFFFFF",
    },
    {
      label: "Other",
      route: "/projectList?projectType=Other",
      color: "#8B5CF6",
      icon: "dots-horizontal-circle" as const,
      textColor: "#FFFFFF",
    },
  ];

  return (
    <View className="flex-1 justify-center items-center bg-[#c7f9cc] px-4">
      <View className="flex-row flex-wrap justify-center items-center gap-4 w-full">
        {projectTypes.map(({ label, route, color, icon, textColor }) => (
          <View
            key={label}
            className="justify-center items-center rounded-xl shadow-md"
            style={{
              backgroundColor: color,
              width: "45%",
              aspectRatio: 1,
            }}
          >
            <Button
              onPress={() => router.push(route as any)}
              style={{ width: "100%", height: "100%" }}
              contentStyle={{ height: "100%", justifyContent: "center" }}
            >
              <View className="items-center gap-2">
                <MaterialCommunityIcons
                  name={icon}
                  size={48}
                  color={textColor}
                />
                <Text
                  className="font-bold text-xl tracking-wide text-center"
                  style={{ color: textColor }}
                >
                  {label}
                </Text>
              </View>
            </Button>
          </View>
        ))}
      </View>
    </View>
  );
}
