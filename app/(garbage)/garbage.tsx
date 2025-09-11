import { useRouter } from "expo-router";
import { View } from "react-native";
import { Button, Text } from "react-native-paper";

export default function Garbage() {
  const router = useRouter();
  const title = "your dynamic title from params or computed";

  return (
    <View className="flex-1 justify-center items-center gap-5">
      {/* <Stack.Screen
        options={{
          title: `Complains`,
        }}
      /> */}
      <View className="flex justify-center items-center bg-blue-300 py-6 w-3/4 rounded-xl ">
        <Button onPress={() => router.push("/(garbage)/tracking")}>
          <Text className="font-bold text-3xl text-slate-50 ">Tracking</Text>
        </Button>
      </View>
      <View className="flex justify-center items-center bg-blue-300 py-6 w-3/4 rounded-xl ">
        <Button onPress={() => router.push("/(garbage)/shedule")}>
          <Text className="font-bold text-3xl text-slate-50 ">Shedule</Text>
        </Button>
      </View>
      <View className="flex justify-center items-center bg-blue-300 py-6 w-3/4 rounded-xl ">
        <Button>
          <Text className="font-bold text-3xl text-slate-50 ">
            Announcement
          </Text>
        </Button>
      </View>
      <View className="flex justify-center items-center bg-blue-300 py-6 w-3/4 rounded-xl ">
        <Button>
          <Text className="font-bold text-3xl text-slate-50 ">Complain</Text>
        </Button>
      </View>
    </View>
  );
}
