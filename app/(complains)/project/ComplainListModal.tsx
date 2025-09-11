import { useEffect, useState } from "react";
import { FlatList, View } from "react-native";
import { Badge, Card, IconButton, Text } from "react-native-paper";

export default function ComplainListModel({ project }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Fetch data or perform any side effects here
    fetchComplainList();
  }, []);

  async function fetchComplainList() {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/complain/projectcomplains/${project.id}`
      );

      const result = await response.json();

      // Handle new ApiResponse structure
      if (result && typeof result === "object" && "isSuccess" in result) {
        if (!result.isSuccess) {
          console.error("Fetching complain list failed:", result.message);
          setData([]);
          return;
        }
        setData(result.data || []);
      } else {
        // Fallback for old response format
        setData(result || []);
      }
    } catch (error) {
      console.log("fetch active complains", error?.message);
      setData([]);
    }
  }

  async function handleDelete(complainId) {
    // Handle delete logic here
    try {
      const deleteResponse = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/complain/projectcomplain/${complainId}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      const deleteResult = await deleteResponse.json();

      // Handle new ApiResponse structure for delete
      if (
        deleteResult &&
        typeof deleteResult === "object" &&
        "isSuccess" in deleteResult
      ) {
        if (!deleteResult.isSuccess) {
          console.error("Deleting complain failed:", deleteResult.message);
          return;
        }
      }

      // Refresh the list after successful deletion
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/complain/projectcomplains/${project.id}`
      );
      const newData = await response.json();

      // Handle new ApiResponse structure for refresh
      if (newData && typeof newData === "object" && "isSuccess" in newData) {
        if (!newData.isSuccess) {
          console.error("Refreshing complain list failed:", newData.message);
          setData([]);
          return;
        }
        setData(newData.data || []);
      } else {
        // Fallback for old response format
        setData(newData || []);
      }

      console.log("res general complain", newData);
    } catch (error) {
      console.log("fetch active complains", error.message);
    } finally {
    }
  }

  function itemRender({ item }) {
    console.log("23", item.name, item.ticketPackages?.length);

    return (
      <Card className="w-full mt-2">
        <View className="flex-row items-center mx-5 p-4">
          <View className="w-10/12 gap-4">
            <View className="flex-row gap-6">
              <Badge size={30} style={{ backgroundColor: "green" }}>
                {item.complainId}
              </Badge>
              <Text>{item.subject}</Text>
            </View>
            <View className="flex-row justify-between">
              {item?.ticketPackages?.map((ticket) => (
                <Text>{ticket?.ticket?.title}</Text>
              ))}

              <Text>2026-1-2</Text>
            </View>
          </View>
          {item?.ticketPackages?.length === 0 ? (
            <View className="flex-row justify-end w-2/12">
              <IconButton
                icon="delete"
                onPress={() => handleDelete(item.complainId)}
              />
            </View>
          ) : null}
        </View>
      </Card>
    );
  }

  return (
    <View>
      <FlatList
        data={data}
        renderItem={itemRender} // Replace with your item rendering
        keyExtractor={(item, index) => item.complainId} // Use a unique key
      />
    </View>
  );
}
