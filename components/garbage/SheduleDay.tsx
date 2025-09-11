import { View } from "react-native";
import { Text } from "react-native-paper";

export default function SheduleDay({ shedules, day, className = "" }) {
  const shedule = shedules?.find((schedule) => schedule.day === day);

  return (
    <>
      {shedule ? (
        <View className={`flex-row  gap-2 p-2 ${className}`}>
          <View className="w-1/3">
            <Text className="font-semibold text-xl">{shedule.day}</Text>
          </View>
          <View className="w-1/3">
            <Text className="font-semibold text-xl">{shedule.type}</Text>
          </View>
          <View className="w-1/3">
            <Text className="font-semibold text-xl">{shedule.time}</Text>
          </View>
        </View>
      ) : null}
    </>
  );
}
