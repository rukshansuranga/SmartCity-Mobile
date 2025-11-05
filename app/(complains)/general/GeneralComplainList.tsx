import {
  deleteGeneralComplain,
  GetGeneralComplainPaging,
} from "@/api/complainAction";

import CommentManager from "@/components/CommentManager";
import { useAuthStore } from "@/stores/authStore";
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
import { ComplainStatus, EntityType } from "../../../enums/enum";

const pageSize = 10;

// Refactored ComplainItem component
function ComplainItem({ item, router, deletePrivateComplainHandler = null }) {
  const userInfo = useAuthStore((state) => state.userInfo);
  const isOwner =
    userInfo && item.residentId && userInfo.sub === item.residentId;
  const hasTicket = item?.ticketPackages && item.ticketPackages.length > 0;

  // Extract ticket info if present
  const ticketInfo = hasTicket
    ? item.ticketPackages.map((ticket, idx) => (
        <View
          key={ticket?.ticket?.id || ticket?.ticketId || idx}
          style={{ marginBottom: 2 }}
        >
          <Text className="text-[#22577a] text-xs font-bold">
            Ticket: {ticket?.ticket?.subject || "-"} (
            {ticket?.ticket?.status || "-"})
          </Text>
        </View>
      ))
    : null;

  return (
    <Card
      className="mt-2 border border-[#38a3a5] bg-[#c7f9cc]"
      onPress={() =>
        router.push({
          pathname: "/(complains)/general/ManageGeneralComplain",
          params: { complainId: item.complainId },
        })
      }
    >
      <View className="flex mx-5 gap-4 p-4">
        <View className="flex-row items-center gap-4 mb-2">
          <Badge
            size={30}
            style={{ backgroundColor: "#38a3a5", color: "#fff" }}
          >
            {item.complainId}
          </Badge>
          <Text className="text-[#22577a] font-bold text-base flex-1">
            {item.subject}
          </Text>
        </View>
        <View className="flex-row gap-6 mb-1">
          <Text className="text-[#38a3a5] text-xs">
            Created:{" "}
            {item.createdAt
              ? new Date(item.createdAt).toLocaleDateString()
              : "-"}
          </Text>
          <Text className="text-[#38a3a5] text-xs">
            Status: {ComplainStatus[item.status] || "-"}
          </Text>
        </View>
        {hasTicket && <View className="mb-1">{ticketInfo}</View>}
        <View className="flex-row gap-2 mt-2 items-center">
          <CommentManager
            entityId={item.complainId?.toString()}
            entityType={EntityType.GeneralComplain}
          />
          {isOwner && !hasTicket && (
            <>
              <IconButton
                icon="pencil"
                iconColor="#38a3a5"
                size={24}
                style={{ backgroundColor: "#c7f9cc" }}
                onPress={(e) => {
                  e.stopPropagation && e.stopPropagation();
                  router.push({
                    pathname: "/(complains)/general/ManageGeneralComplain",
                    params: { complainId: item.complainId },
                  });
                }}
              />
              {deletePrivateComplainHandler && (
                <IconButton
                  icon="delete"
                  iconColor="#22577a"
                  size={24}
                  style={{ backgroundColor: "#57cc99" }}
                  onPress={(e) => {
                    e.stopPropagation && e.stopPropagation();
                    deletePrivateComplainHandler(item);
                  }}
                />
              )}
            </>
          )}
        </View>
      </View>
    </Card>
  );
}

// PrivateList component
function PrivateList({
  data,
  isLoading,
  router,
  deletePrivateComplainHandler,
}) {
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator animating={true} color={MD2Colors.blue500} />
      </View>
    );
  }
  return (
    <>
      {data.length === 0 ? (
        <Card className="w-full h-1/3 justify-center items-center mt-4 bg-[#80ed99]">
          <Text className="text-[#22577a]">No Complains Found</Text>
        </Card>
      ) : (
        <FlatList
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 16 }}
          data={data}
          renderItem={({ item }) => (
            <ComplainItem
              item={item}
              isPrivate={true}
              router={router}
              deletePrivateComplainHandler={deletePrivateComplainHandler}
            />
          )}
          keyExtractor={(item) => item.complainId}
        />
      )}
    </>
  );
}

// PublicList component
function PublicList({ data, isLoading, router }) {
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator animating={true} color={MD2Colors.blue500} />
      </View>
    );
  }
  return (
    <>
      {data.length === 0 ? (
        <Card className="w-full h-1/3 justify-center items-center mt-4 bg-[#80ed99]">
          <Text className="text-[#22577a]">No Complains Found</Text>
        </Card>
      ) : (
        <FlatList
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 16 }}
          data={data}
          renderItem={({ item }) => (
            <ComplainItem item={item} isPrivate={false} router={router} />
          )}
          keyExtractor={(item) => item.complainId}
        />
      )}
    </>
  );
}

export default function GeneralComplainList() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isPrivate, setIsPrivate] = useState(() => {
    if (params && params.isPrivate) {
      return params.isPrivate === "true";
    }
    return false;
  });
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  console.log("Initial isPrivate from params:", params?.isPrivate, isPrivate);

  useEffect(() => {
    // If navigation param changes, update isPrivate state
    if (params && typeof params.isPrivate === "string") {
      setIsPrivate(params.isPrivate === "true");
    }
    // Always fetch data when isPrivate or params.random changes
    fetchData(
      params && typeof params.isPrivate === "string"
        ? params.isPrivate === "true"
        : isPrivate
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.isPrivate, params?.random]);

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
    } catch (error) {
      console.error("Error deleting complain:", error);
    }
  }

  console.log("Rendering GeneralComplainList with isPrivate:", isPrivate);

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
                    router.push({
                      pathname: "/(complains)/general/ManageGeneralComplain",
                      params: { isPrivate: isPrivate ? "true" : "false" },
                    })
                  }
                >
                  Add
                </Button>
              </View>
            </View>
            {isPrivate ? (
              <PrivateList
                data={data}
                isLoading={isLoading}
                router={router}
                deletePrivateComplainHandler={deletePrivateComplainHandler}
              />
            ) : (
              <PublicList data={data} isLoading={isLoading} router={router} />
            )}
          </View>
          <View className="w-full h-20 justify-center bg-[#80ed99]">
            <View className="flex-row justify-center gap-3">
              <Button
                // {...(isPrivate
                //   ? { mode: "contained" }
                //   : { mode: "contained-tonal" })}
                mode="contained"
                style={{
                  backgroundColor: isPrivate ? "#22577a" : "#57cc99",
                }}
                labelStyle={{ color: "#fff", fontWeight: "bold" }}
                onPress={privateButtonClickHandler}
              >
                Private
              </Button>
              <Button
                // {...(isPrivate
                //   ? { mode: "contained-tonal" }
                //   : { mode: "contained" })}
                mode="contained"
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
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
