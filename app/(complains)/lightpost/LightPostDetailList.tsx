import { getListPostsSpecificCategoryByPostNoAndName } from "@/api/lightPostAction";
import { useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";

export default function LightPostDetailList({
  postNo,
  name,
}: {
  postNo: string;
  name: string;
}) {
  const [activeComplainList, setActiveComplainList] = useState([]);

  useEffect(() => {
    console.log(23);
    async function getComplains() {
      try {
        const data = await getListPostsSpecificCategoryByPostNoAndName(
          postNo,
          name
        );
        if (!data.isSuccess) {
          console.error(
            "Failed to fetch specific complain details:",
            data.message
          );
          setActiveComplainList([]);
          return;
        }
        setActiveComplainList(data.data || []);
      } catch (error) {
        console.log("fetch active complains", error.message);
        setActiveComplainList([]);
      }
    }

    getComplains();
  }, []);

  console.log(45, activeComplainList);

  const renderList = ({ item }) => {
    return (
      <View className="flex justify-center items-stretch rounded-xl shadow-lg bg-[#80ed99] m-2 p-3 border border-[#57cc99]">
        <View className="flex-row w-full gap-2 mb-2">
          <View className="flex-1">
            <Text className="font-semibold text-base text-[#22577a]">
              {item.clientName}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-base text-[#38a3a5]">
              {item.status}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-base text-[#22577a]">
              {new Date(item.complainDate).toISOString().slice(5, 10)}
            </Text>
          </View>
        </View>
        <View className="flex-row flex-wrap justify-center gap-2">
          {item.ticketList.map((ticket) => (
            <View
              key={ticket.id}
              className="bg-[#c7f9cc] px-2 py-1 rounded-lg border border-[#57cc99]"
            >
              <Text className="text-[#22577a] font-medium">{ticket.title}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View className="flex justify-between items-center py-4 bg-[#c7f9cc]">
      <View className="mb-4">
        <Text className="font-bold text-2xl text-[#22577a]">
          Complain Details
        </Text>
      </View>
      <View className="w-full">
        <FlatList
          data={activeComplainList}
          renderItem={renderList}
          keyExtractor={(item) => item.complainId}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      </View>
    </View>
  );
}
