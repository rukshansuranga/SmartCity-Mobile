import { EntityType } from "@/types";
import React from "react";
import { Modal, Text, View } from "react-native";
import { IconButton } from "react-native-paper";
import CommentSection from "./CommentSection";

interface CommentModalProps {
  visible: boolean;
  onClose: () => void;
  entityId?: string;
  entityType?: EntityType;
  isPrivate: boolean;
}

export const CommentModal: React.FC<CommentModalProps> = ({
  visible,
  onClose,
  entityId,
  entityType,
  isPrivate,
}) => {
  if (!entityId) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
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
              onPress={onClose}
            />
          </View>

          {/* Header */}
          <Text className="font-bold text-2xl text-[#22577a] mb-4 ">
            Comments
          </Text>

          <View className="flex-1">
            <CommentSection
              entityType={EntityType.GeneralComplain}
              entityId={entityId || ""}
              isPrivate={isPrivate}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CommentModal;
