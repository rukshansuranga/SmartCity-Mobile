import { getProjectComplainsByProjectId } from "@/api/complainAction";
import { CommentModal } from "@/components/CommentModal";
import { WorkpackageStatus } from "@/enums/enum";
import { EntityType, ProjectComplain } from "@/types";
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, Modal, Text, View } from "react-native";
import {
  ActivityIndicator,
  Badge,
  Button,
  Card,
  IconButton,
  MD2Colors,
} from "react-native-paper";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import ComplainAddModal from "../../(complains)/project/ComplainAddModal";
import { appStore } from "../../../stores/appStore";

/**
 * Complains Component
 *
 * This component displays a list of complains for a specific project and manages two modals:
 * 1. Add Project Complain Modal - For creating new project complains
 * 2. Comments Modal - For managing comments on a specific project complain
 */
export default function Complains() {
  const currentProjectId = appStore((state) => state.currentProjectId);
  const [complains, setComplains] = useState<ProjectComplain[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedComplain, setSelectedComplain] =
    useState<ProjectComplain | null>(null);
  const [isCommentsModalVisible, setIsCommentsModalVisible] = useState(false);
  const [isAddComplainModalVisible, setIsAddComplainModalVisible] =
    useState(false);

  console.log("Current Project ID:", currentProjectId);

  const fetchProjectComplains = useCallback(async () => {
    if (!currentProjectId) return;

    setIsLoading(true);
    try {
      console.log(
        "Fetching complains for project IDxxxxxxxx:",
        currentProjectId
      );
      const response = await getProjectComplainsByProjectId(
        Number(currentProjectId)
      );

      if (!response.isSuccess) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: `Failed to fetch project complains: ${response.message}`,
        });
        setComplains([]);
        return;
      }

      setComplains(response.data || []);
    } catch (error) {
      console.error("Error fetching project complains:", error);
      setComplains([]);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to fetch project complains",
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentProjectId]);

  useEffect(() => {
    if (currentProjectId) {
      fetchProjectComplains();
    }
  }, [currentProjectId, fetchProjectComplains]);

  function getStatusText(status?: WorkpackageStatus): string {
    switch (status) {
      case WorkpackageStatus.New:
        return "New";
      case WorkpackageStatus.InProgress:
        return "In Progress";
      case WorkpackageStatus.Close:
        return "Closed";
      default:
        return "Unknown";
    }
  }

  function getStatusColor(status?: WorkpackageStatus): string {
    switch (status) {
      case WorkpackageStatus.New:
        return "#38a3a5";
      case WorkpackageStatus.InProgress:
        return "#57cc99";
      case WorkpackageStatus.Close:
        return "#22577a";
      default:
        return "#666";
    }
  }

  function commentClickHandle(item: ProjectComplain) {
    setSelectedComplain(item);
    setIsCommentsModalVisible(true);
  }

  function handleAddComplain() {
    setIsAddComplainModalVisible(true);
  }

  function handleCloseAddComplainModal() {
    setIsAddComplainModalVisible(false);
    // Refresh the complains list after adding a new complain
    fetchProjectComplains();
  }

  function handleCloseCommentsModal() {
    setIsCommentsModalVisible(false);
    setSelectedComplain(null);
  }

  function formatDate(dateString?: string): string {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "";
    }
  }

  function renderComplainItem({ item }: { item: ProjectComplain }) {
    return (
      <Card className="mt-2 border border-[#38a3a5] bg-[#c7f9cc]">
        <View className="flex mx-5 gap-4 p-4">
          <View className="flex-row justify-between items-center">
            <Badge
              size={30}
              style={{ backgroundColor: "#38a3a5", color: "#fff" }}
            >
              {item.complainId}
            </Badge>
            <View className="flex-1 ml-4">
              <Text className="text-[#22577a] font-bold text-base">
                {item.subject}
              </Text>
              {item.detail && (
                <Text className="text-[#666] text-sm mt-1" numberOfLines={2}>
                  {item.detail}
                </Text>
              )}
            </View>
          </View>

          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center gap-2">
              <View
                style={{
                  backgroundColor: getStatusColor(item.status),
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 12,
                }}
              >
                <Text className="text-white text-xs font-medium">
                  {getStatusText(item.status)}
                </Text>
              </View>
              {item.createdAt && (
                <Text className="text-[#38a3a5] text-xs">
                  {formatDate(item.createdAt)}
                </Text>
              )}
            </View>

            <View className="flex-row items-center gap-2">
              {item.client && (
                <Text className="text-[#38a3a5] font-bold text-sm">
                  {item.client.firstName} {item.client.lastName}
                </Text>
              )}
              {/* Comments button - opens modal to manage comments for this specific complain */}
              <IconButton
                icon="comment"
                iconColor="#38a3a5"
                size={20}
                onPress={() => commentClickHandle(item)}
              />
            </View>
          </View>
        </View>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#c7f9cc]">
        <ActivityIndicator animating={true} color={MD2Colors.blue500} />
        <Text className="text-[#22577a] mt-2">Loading complains...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-[#c7f9cc]">
        <View className="flex-1 items-center">
          <View className="w-11/12 flex-1">
            <View className="flex-row justify-between items-center mx-4 mt-4 mb-2">
              <View className="flex-row items-center gap-2">
                <Text className="font-extrabold text-xl text-[#22577a]">
                  Complains
                </Text>
                <Badge
                  size={20}
                  style={{
                    backgroundColor: "#38a3a5",
                    color: "#fff",
                    alignSelf: "center",
                  }}
                >
                  {complains.length}
                </Badge>
              </View>
              <Button
                mode="contained"
                icon="plus"
                style={{ backgroundColor: "#38a3a5" }}
                labelStyle={{ color: "#fff", fontWeight: "bold" }}
                onPress={handleAddComplain}
              >
                Complain
              </Button>
            </View>

            {complains.length === 0 && !isLoading ? (
              <Card className="w-full h-1/3 justify-center items-center mt-4 bg-[#80ed99]">
                <Text className="text-[#22577a] text-center font-semibold">
                  No complains found for this project
                </Text>
                <Text className="text-[#666] text-center mt-2">
                  Complains will appear here when they are submitted
                </Text>
              </Card>
            ) : (
              <FlatList
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingTop: 8, paddingBottom: 16 }}
                data={complains}
                renderItem={renderComplainItem}
                keyExtractor={(item) => item.complainId.toString()}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </View>

        {/* Comments Modal - for managing comments on a specific project complain */}
        <CommentModal
          visible={isCommentsModalVisible}
          onClose={handleCloseCommentsModal}
          entityId={selectedComplain?.complainId?.toString() || ""}
          entityType={EntityType.ProjectComplain}
          isPrivate={false}
        />

        {/* Add Project Complain Modal - for creating new project complains */}
        <Modal
          visible={isAddComplainModalVisible && !!currentProjectId}
          transparent={true}
          animationType="slide"
          onRequestClose={handleCloseAddComplainModal}
        >
          <View className="flex-1 justify-center items-center bg-[#57cc99]/80">
            <View
              className="w-11/12 h-5/6 bg-[#f6fff8] rounded-2xl p-4"
              style={{
                elevation: 8, // Android shadow
                shadowColor: "#000", // iOS shadow
                shadowOffset: {
                  width: 0,
                  height: 4,
                },
                shadowOpacity: 0.3,
                shadowRadius: 4.65,
              }}
            >
              <View className="absolute top-2 right-2 z-10">
                <IconButton
                  icon="close"
                  className="bg-[#57cc99]"
                  size={18}
                  mode="contained"
                  onPress={handleCloseAddComplainModal}
                />
              </View>

              {/* Header */}
              <Text className="font-bold text-2xl text-[#22577a] mb-4 ">
                Add Project Complain
              </Text>
              <ComplainAddModal
                project={{ id: Number(currentProjectId) }}
                closeModel={handleCloseAddComplainModal}
              />
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
