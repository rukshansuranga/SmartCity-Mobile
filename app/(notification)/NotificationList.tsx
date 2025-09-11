import {
  addRating,
  getNotifications,
  readNotification,
} from "@/api/notificationAction";
import Rating from "@/components/Rating";
import { useAuthStore } from "@/stores/authStore";
import { useEffect, useState } from "react";
import { FlatList, Image, Modal, Pressable, Text, View } from "react-native";
import { Button, Card, IconButton, TextInput } from "react-native-paper";

const iconMap = {
  LightPostComplain: require("@/assets/icons/LightPostComplain.png"),
  ProjectComplain: require("@/assets/icons/ProjectComplain.png"),
  Notification: require("@/assets/icons/notification1.png"), // Make sure this matches your new PNG filename
  // Add more mappings as needed
};

export default function NotificationList() {
  const { userInfo } = useAuthStore();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const [selectedNotification, setSelectedNotification] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [starRating, setStarRating] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, [userInfo.sub]);

  async function fetchNotifications() {
    try {
      const res = await getNotifications(userInfo.sub);
      if (!res.isSuccess) {
        console.error("Failed to fetch notifications:", res.message);
        setNotifications([]);
        return;
      }
      console.log("Fetched notifications:", res.data);
      setNotifications(res.data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
      // Toast error is already shown by fetchWrapper
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading notifications...</Text>
      </View>
    );
  }

  async function handleRating() {
    if (!selectedNotification?.complain?.complainId || !starRating) return;

    try {
      const result = await addRating({
        complainId: selectedNotification.complain.complainId,
        rating: starRating,
        note: feedback,
        clientId: userInfo.sub,
        notificationId: selectedNotification.id,
      });
      if (!result.isSuccess) {
        console.error("Failed to add rating:", result.message);
        return;
      }
      console.log("Rating added successfully:", result.data);

      setFeedback("");
      setModalVisible(false);
      await fetchNotifications();
    } catch (error) {
      console.error("Error adding rating:", error);
      // Toast error is already shown by fetchWrapper
    }
  }

  async function handleNotificationPress(item) {
    try {
      if (!item.isRead) {
        const readResult = await readNotification(item.id);
        if (!readResult.isSuccess) {
          console.error(
            "Failed to mark notification as read:",
            readResult.message
          );
        }
      }
      setSelectedNotification(item);
      setModalVisible(true);
      await fetchNotifications();
    } catch (error) {
      console.error("Error reading notification:", error);
      // Toast error is already shown by fetchWrapper
    }
  }

  return (
    <>
      <View className="flex-1 p-4 bg-[#c7f9cc]">
        <FlatList
          data={notifications}
          keyExtractor={(item) =>
            item.id?.toString() || Math.random().toString()
          }
          renderItem={({ item }) => {
            return (
              <Card className="mb-2 px-3 py-2 bg-[#80ed99] rounded-xl">
                <Pressable onPress={() => handleNotificationPress(item)}>
                  <View className="flex flex-row justify-start gap-2 items-center">
                    <View>
                      <Image
                        source={
                          iconMap[item?.complain?.complainType] ||
                          require("@/assets/icons/LightPostComplain.png")
                        }
                        className="w-7 h-7"
                        style={{ tintColor: "#22577a" }}
                        resizeMode="contain"
                      />
                    </View>
                    <View>
                      <Text
                        className={`text-lg ${item.isRead ? "" : "font-bold"} text-[#22577a]`}
                      >
                        {item.subject}
                      </Text>
                      <Text
                        className={`text-base ${item.isRead ? "" : "font-bold"} text-[#38a3a5]`}
                      >
                        {item.message}
                      </Text>
                    </View>
                  </View>
                  {item.status === 1 && (
                    <View className="self-end elevation-md p-1 rounded-md bg-[#80ed99]">
                      <Image
                        source={require("@/assets/icons/rating.png")}
                        className="w-7 h-6"
                        //style={{ tintColor: "#22577a" }}
                        //resizeMode="contain"
                      />
                    </View>
                  )}
                  {/* <Pressable className="self-end p-1 rounded-md bg-[#80ed99]"></Pressable> */}
                </Pressable>
              </Card>
            );
          }}
          ListEmptyComponent={
            <Text className="text-[#57cc99] font-bold text-lg">
              No notifications found.
            </Text>
          }
        />
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View className="flex-1 justify-center items-center bg-[#57cc99]/80">
          <View className="w-4/5 p-4 bg-[#f6fff8] rounded-2xl items-center elevation-sm gap-4 relative">
            <Text className="font-bold text-2xl text-[#22577a] self-start">
              Add List
            </Text>

            <Card className="w-full px-2 py-2 bg-[#80ed99] rounded-xl">
              <View>
                <Text className="text-[#22577a] font-bold">Subject</Text>
                <Text className="text-[#22577a]">
                  {selectedNotification?.subject}
                </Text>
              </View>
              <View className="mt-2">
                <Text className="text-[#38a3a5] font-bold">Message</Text>
                <Text className="text-[#38a3a5]">
                  {selectedNotification?.message}
                </Text>
              </View>
            </Card>

            <Card className="w-full px-2 py-2 bg-[#57cc99] rounded-xl">
              <View>
                <Text className="text-[#22577a] font-bold">Complain</Text>
                <Text className="text-[#22577a]">
                  {selectedNotification?.complain?.subject}
                </Text>
              </View>
              <View className="flex flex-row justify-between mt-3">
                <Text className="text-[#22577a] font-bold">Created Date</Text>
                <Text className="text-[#22577a]">
                  {new Date(selectedNotification?.complain?.createdAt)
                    .toLocaleString()
                    .slice(0, 9)}
                </Text>
              </View>
            </Card>
            {selectedNotification?.type === 2 &&
              selectedNotification.status === 6 && (
                <Card className="w-full">
                  <View className="flex flex-row justify-center items-center gap-2 px-2 py-2  rounded-xl">
                    <Text className="text-[#22577a] font-bold">
                      Your have Given
                    </Text>

                    <Text className="font-bold text-xl bg-[#57cc99] rounded-full px-4 py-2">
                      {selectedNotification?.complain?.rating}
                    </Text>

                    <Text>Starts</Text>
                  </View>
                </Card>
              )}

            {selectedNotification?.type === 2 &&
              selectedNotification.status === 1 && (
                <Card className="flex w-full px-2 pb-2 bg-[#80ed99] rounded-xl">
                  <View>
                    <Rating
                      starRating={starRating}
                      setStarRating={setStarRating}
                    />
                  </View>
                  <View className="mt-2">
                    <Text className="text-[#22577a] font-bold">
                      Add your feedback
                    </Text>
                    <TextInput
                      className="bg-[#f6fff8] border border-[#57cc99] rounded-lg px-2 py-1 mt-2 text-[#22577a]"
                      value={feedback}
                      onChangeText={setFeedback}
                      multiline
                      numberOfLines={4}
                    />
                  </View>
                  <View className="flex flex-row justify-center mt-2">
                    <Button
                      mode="contained"
                      className="mt-2"
                      style={{ backgroundColor: "#38a3a5" }}
                      labelStyle={{ color: "#fff", fontWeight: "bold" }}
                      onPress={handleRating}
                    >
                      <Text className="text-white font-bold">Add Rating</Text>
                    </Button>
                  </View>
                </Card>
              )}

            <View
              style={{ position: "absolute", top: 2, right: 8, zIndex: 10 }}
            >
              <IconButton
                icon="close"
                className="bg-[#57cc99]"
                size={18}
                mode="contained"
                onPress={() => setModalVisible(!modalVisible)}
              />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
