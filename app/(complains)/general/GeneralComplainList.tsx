import {
  deleteGeneralComplain,
  GetGeneralComplainPaging,
} from "@/api/complainAction";
import { CommentModal } from "@/components/CommentModal";
import { EntityType } from "@/types";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";
import Toast from "react-native-toast-message";

import {
  ActivityIndicator,
  Badge,
  Button,
  Card,
  IconButton,
  MD2Colors,
} from "react-native-paper";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

const pageSize = 10;

export default function GeneralComplainList() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [isPrivate, setIsPrivate] = useState(() => {
    if (params.isPrivate !== undefined) {
      return params.isPrivate === "true";
    }
    return false;
  });

  console.log("isPrivate", isPrivate, params.isPrivate);

  const [selectedGeneralComplain, setSelectedGeneralComplain] = useState(null);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (params?.isPrivate !== undefined) {
      fetchData(params.isPrivate === "true");
    } else {
      fetchData();
    }
  }, [params?.random, params?.isPrivate]);

  // Fetch data when modal becomes visible
  useEffect(() => {
    if (modalVisible) {
      fetchData(isPrivate);
    }
  }, [modalVisible, isPrivate]);

  async function fetchData(isPrivate = false) {
    setIsLoading(true);
    try {
      const res = await GetGeneralComplainPaging(1, isPrivate, pageSize);
      if (!res.isSuccess) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: `Failed to fetch general complains: ${res.message}`,
        });
        setData([]);
        return;
      }
      setData(res.data || []);
    } catch (error) {
      console.error("Error fetching general complains:", error);
      setData([]);
      // Toast error is already shown by fetchWrapper
    } finally {
      setIsLoading(false);
    }
  }

  function privateButtonClickHandler() {
    setData([]);
    setIsPrivate(true);
    fetchData(true);
  }

  function publicButtonClickHandler() {
    setData([]);
    setIsPrivate(false);
    fetchData(false);
  }

  function commentClickHandle(item) {
    setModalVisible(!modalVisible);
    setSelectedGeneralComplain(item);
  }

  function modalCloseHandler() {
    console.log("modal closed");
    setModalVisible(false);
  }

  // async function addCommentHandler(comment) {
  //   console.log("Add comment", comment);
  //   await addComment(comment);
  // }

  async function deletePrivateComplainHandler(item) {
    try {
      const deleteResult = await deleteGeneralComplain(item.complainId);
      if (!deleteResult.isSuccess) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: `Failed to delete complain: ${deleteResult.message}`,
        });
        return;
      }
      console.log("Complain deleted successfully");

      const newData = await GetGeneralComplainPaging(1, isPrivate, pageSize);
      if (!newData.isSuccess) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: `Failed to fetch updated complains: ${newData.message}`,
        });
        return;
      }
      setData(newData.data || []);

      console.log("res general complain", newData.data);
    } catch (error) {
      console.error("Error deleting complain:", error);
      // Toast error is already shown by fetchWrapper
    }
  }

  console.log("comment list", selectedGeneralComplain?.comments);

  function itemRender({ item }) {
    // Color scheme
    // #22577a, #38a3a5, #57cc99, #80ed99, #c7f9cc
    if (isPrivate) {
      return (
        <Card className="w-full mt-2 border border-[#57cc99] bg-[#80ed99]">
          <View className="flex-row items-center mx-5 p-4">
            <View className="w-10/12 gap-4">
              <View className="flex-row gap-6 items-center">
                <Badge
                  size={30}
                  style={{ backgroundColor: "#38a3a5", color: "#fff" }}
                >
                  {item.complainId}
                </Badge>
                <Text className="text-[#22577a] font-bold text-base">
                  {item.subject}
                </Text>
              </View>
              <View className="flex-row justify-between items-center mt-2">
                <View className="flex-row gap-2">
                  {item?.ticketPackages?.map((ticket, idx) => (
                    <Text key={idx} className="text-[#22577a] text-xs">
                      {ticket?.ticket?.subject}
                    </Text>
                  ))}
                </View>
                <Text className="text-[#38a3a5] text-xs">2026-1-2</Text>
              </View>
            </View>
            {item?.ticketPackages?.length === 0 ? (
              <View className="flex-row justify-end w-2/12">
                <IconButton
                  icon="delete"
                  iconColor="#22577a"
                  size={24}
                  style={{ backgroundColor: "#57cc99" }}
                  onPress={() => deletePrivateComplainHandler(item)}
                />
              </View>
            ) : null}
          </View>
        </Card>
      );
    }
    // Public
    return (
      <Card className="mt-2 border border-[#38a3a5] bg-[#c7f9cc]">
        <View className="flex mx-5 gap-6 p-4">
          <View className="flex-row justify-between items-center">
            <Badge
              size={30}
              style={{ backgroundColor: "#38a3a5", color: "#fff" }}
            >
              {item.complainId}
            </Badge>
            <Text className="text-[#22577a] font-bold text-base">
              {item.subject}
            </Text>
          </View>
          <View className="flex-row justify-between items-center mt-2">
            <View className="flex-row gap-2">
              {item?.ticketPackages?.map((ticket) => (
                <Text
                  key={ticket?.ticket?.id || ticket?.ticketId}
                  className="text-[#22577a] text-xs"
                >
                  {ticket?.ticket?.subject}
                </Text>
              ))}
            </View>
            <Text className="text-[#38a3a5] font-bold">
              {item?.client?.name}
            </Text>
            <IconButton
              icon="comment"
              iconColor="#38a3a5"
              size={20}
              onPress={() => commentClickHandle(item)}
            />
          </View>
        </View>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator animating={true} color={MD2Colors.blue500} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-[#c7f9cc]">
        <View className="flex-1 justify-between items-center">
          <View className="w-11/12 flex-1">
            <View className="flex-row justify-between items-center mx-4 mt-4">
              <View>
                <Text className="font-extrabold text-xl text-[#22577a]">
                  Complain List
                </Text>
              </View>
              <View>
                <Button
                  mode="contained"
                  style={{ backgroundColor: "#38a3a5" }}
                  labelStyle={{ color: "#fff", fontWeight: "bold" }}
                  onPress={() =>
                    router.push("/(complains)/general/AddGeneralComplain")
                  }
                >
                  Add
                </Button>
              </View>
            </View>
            {data.length === 0 && !isLoading ? (
              <Card className="w-full h-1/3 justify-center items-center mt-4 bg-[#80ed99]">
                <Text className="text-[#22577a]">No Complains Found</Text>
              </Card>
            ) : (
              <FlatList
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingTop: 8, paddingBottom: 16 }}
                data={data}
                renderItem={itemRender}
                keyExtractor={(item, index) => item.complainId}
              />
            )}
          </View>
          <View className="w-full h-20 justify-center bg-[#80ed99]">
            <View className="flex-row justify-center gap-3">
              <Button
                {...(isPrivate
                  ? { mode: "contained" }
                  : { mode: "contained-tonal" })}
                style={{
                  backgroundColor: isPrivate ? "#22577a" : "#57cc99",
                }}
                labelStyle={{ color: "#fff", fontWeight: "bold" }}
                onPress={privateButtonClickHandler}
              >
                Private
              </Button>
              <Button
                {...(isPrivate
                  ? { mode: "contained-tonal" }
                  : { mode: "contained" })}
                style={{
                  backgroundColor: !isPrivate ? "#22577a" : "#57cc99",
                }}
                labelStyle={{ color: "#fff", fontWeight: "bold" }}
                onPress={publicButtonClickHandler}
              >
                Public
              </Button>
            </View>
          </View>
        </View>
        <CommentModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          entityId={selectedGeneralComplain?.complainId?.toString() || ""}
          entityType={EntityType.GeneralComplain}
          isPrivate={isPrivate}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
