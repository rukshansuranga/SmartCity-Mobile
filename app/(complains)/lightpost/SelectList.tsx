import { Pressable, Text, View } from "react-native";

export default function SelectList({ list, myList, onPress }) {
  console.log("my list", myList);
  return (
    <View className="flex flex-col gap-3">
      {list.map((item) => (
        <View key={item.id} className="mx-4 ">
          <Pressable
            onPress={() => onPress(item.id)}
            className="rounded-xl bg-[#80ed99] border border-[#57cc99] shadow-md"
          >
            <View className="py-3 px-2 rounded-xl justify-center items-center">
              {myList?.some((x) => x.subject == item.id) ? (
                <>
                  <Text className="text-center text-xl font-semibold text-[#22577a]">
                    {typeof item.name === "object"
                      ? JSON.stringify(item.name)
                      : item.name}
                  </Text>
                  <Text className="text-red-900">You have added Complain</Text>
                </>
              ) : (
                <Text className="text-center text-xl font-semibold text-[#22577a]">
                  {typeof item.name === "object"
                    ? JSON.stringify(item.name)
                    : item.name}
                </Text>
              )}
            </View>
          </Pressable>
        </View>
      ))}
    </View>
  );
}
