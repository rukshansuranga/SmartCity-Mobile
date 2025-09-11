import { CommentSection } from "@/components/CommentSection";
import { EntityType } from "@/types";
import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { appStore } from "../../../stores/appStore";

export default function Feedback() {
  const currentProjectId = appStore((state) => state.currentProjectId);
  const currentProjectType = appStore((state) => state.currentProjectType);

  console.log("Feedback component rendering with:", {
    currentProjectId,
    currentProjectType,
  });

  const cardShadowStyle = {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  };

  const renderContent = () => {
    if (!currentProjectId) {
      return (
        <View className="flex-1 justify-center items-center">
          <Text className="text-[#22577a] text-center text-lg">
            No project selected. Please select a project to view feedback.
          </Text>
        </View>
      );
    }

    return (
      <CommentSection
        entityType={EntityType.ProjectComplain}
        entityId={currentProjectId}
        isPrivate={false}
      />
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#c7f9cc]">
      {/* Main Card Container */}
      <View
        className="flex-1 m-4 p-4 bg-white rounded-lg"
        style={cardShadowStyle}
      >
        <View>
          <Text className="text-xl font-bold text-[#22577a] mb-4">
            Feedback
          </Text>
        </View>
        <CommentSection
          entityType={EntityType.ProjectComplain}
          entityId={currentProjectId}
          isPrivate={false}
        />
      </View>
    </SafeAreaView>
  );
}
