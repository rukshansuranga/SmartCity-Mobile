import { getListPostsByPostNo } from "@/api/lightPostAction";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Badge } from "react-native-paper";
import { complainMap } from "../../../complainMaps";

export default function LightPostSummaryList({
  postNo,
  selectComplainSummary,
}: {
  postNo: string;
  selectComplainSummary: (name: string) => void;
}) {
  const [activeComplainSummaryList, setActiveComplainSummaryList] = useState(
    []
  );

  useEffect(() => {
    async function getComplains() {
      try {
        const data = await getListPostsByPostNo(postNo);
        if (!data.isSuccess) {
          console.error("Failed to fetch complain summary:", data.message);
          setActiveComplainSummaryList([]);
          return;
        }
        setActiveComplainSummaryList(data.data || []);
      } catch (error) {
        console.log("fetch active complains", error.message);
        setActiveComplainSummaryList([]);
      }
    }

    getComplains();
  }, [postNo]);

  if (activeComplainSummaryList.length == 0) {
    return (
      <View className="flex items-center justify-center bg-[#c7f9cc] py-8 rounded-xl">
        <Text className="text-[#22577a] text-lg font-bold">No Complains</Text>
      </View>
    );
  }

  console.log("Active Complains", activeComplainSummaryList);

  return (
    <View className="bg-[#c7f9cc] rounded-xl p-4">
      <View className="flex-row justify-center mb-4">
        <Text className="font-bold text-2xl text-[#22577a]">
          Complain Summary
        </Text>
      </View>
      <View className="flex flex-col gap-3">
        {activeComplainSummaryList?.map((complain) => (
          <Pressable
            key={complain.complainId}
            onPress={() => selectComplainSummary(complain.name)}
          >
            <View
              key={complain.name}
              className="flex-row justify-between items-center py-3 px-4 bg-[#80ed99] rounded-xl shadow-md border border-[#57cc99]"
            >
              <View>
                <Text className="text-xl font-semibold text-[#22577a]">
                  {complainMap.find((c) => c.id == complain.name)?.name ??
                    "TEST"}
                </Text>
              </View>
              <View>
                <Badge size={35} style={{ backgroundColor: "#38a3a5" }}>
                  {complain.count}
                </Badge>
              </View>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
