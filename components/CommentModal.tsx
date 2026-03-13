import { EntityType } from "@/enums/enum";
import React from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  View,
} from "react-native";
import { IconButton } from "react-native-paper";
import { CommentSection } from "./CommentSection";

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
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View className="flex-1 justify-center items-center bg-[#57cc99]/80">
          <View
            className="bg-[#f6fff8] rounded-2xl p-4"
            style={{
              width: "90%",
              height: "85%",
              elevation: 8,
              shadowColor: "#000",
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
                testID="close-comment-modal"
              />
            </View>

            {/* Header */}
            <Text className="font-bold text-2xl text-[#22577a] mb-4 ">
              Comments
            </Text>

            <View style={{ flex: 1 }}>
              <CommentSection
                entityType={entityType}
                entityId={entityId || ""}
                isPrivate={isPrivate}
                onCommentAdded={onClose}
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CommentModal;
