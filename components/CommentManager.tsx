import { EntityType } from "@/enums/enum";
import React, { useState } from "react";
import { IconButton } from "react-native-paper";
import { CommentModal } from "./CommentModal";

interface CommentManagerProps {
  entityId: string;
  entityType: EntityType;
  isPrivate: boolean;
}

const CommentManager: React.FC<CommentManagerProps> = ({
  entityId,
  entityType,
  isPrivate,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <IconButton
        icon="comment"
        size={20}
        onPress={() => setModalVisible(true)}
        accessibilityLabel="Open comments"
      />
      <CommentModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        entityId={entityId}
        entityType={entityType}
        isPrivate={isPrivate}
      />
    </>
  );
};

export default CommentManager;
