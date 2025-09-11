import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { Button } from "react-native-paper";

export default function ComplainsIndex() {
  const router = useRouter();
  const buttons = [
    {
      label: "General",
      route: "/(complains)/general/GeneralComplainList",
      color: "#80ed99",
    },
    {
      label: "Light Post",
      route: "/(complains)/lightpost/LightPostComplainList",
      color: "#57cc99",
    },
    {
      label: "Garbage",
      route: null,
      color: "#38a3a5",
    },
    {
      label: "Project Complain",
      route: "/(complains)/project/SelectProjectForComplain",
      color: "#22577a",
    },
  ];

  return (
    <View className="flex-1 justify-center items-center gap-6 bg-[#c7f9cc] px-4">
      {buttons.map(({ label, route, color }) => (
        <View
          key={label}
          className="flex justify-center items-center w-full rounded-xl shadow-md h-20 px-6"
          style={{ backgroundColor: color }}
        >
          <Button
            onPress={route ? () => router.push(route as any) : undefined}
            style={{ width: "100%", height: "100%" }}
            contentStyle={{ height: "100%" }}
          >
            <Text className="font-bold text-2xl tracking-wide text-center w-full text-white">
              {label}
            </Text>
          </Button>
        </View>
      ))}
    </View>
  );
}
