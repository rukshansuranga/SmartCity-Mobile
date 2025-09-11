import {
  addComment,
  deleteComment,
  getCommentsByEntity,
  updateComment,
} from "@/api/commentAction";
import { CommentType } from "@/enums/enum";
import { useAuthStore } from "@/stores/authStore";
import { Comment, EntityType } from "@/types";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, View } from "react-native";
import { Button, IconButton, MD2Colors, TextInput } from "react-native-paper";
import Toast from "react-native-toast-message";

interface CommentSectionProps {
  entityType: EntityType;
  entityId: string;
  initialComments?: Comment[];
  isPrivate?: boolean;
}

interface CommentItemProps {
  comment: Comment;
  onEdit?: (comment: Comment) => void;
  onDelete?: (commentId: number) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onEdit,
  onDelete,
  canEdit = false,
  canDelete = false,
}) => {
  const { userInfo } = useAuthStore();
  const isFromClient = comment.clientId && !comment.userId;
  const isFromUser = comment.userId && !comment.clientId;
  const isOwner =
    (isFromClient && comment.clientId === userInfo?.sub) ||
    (isFromUser && comment.userId === userInfo?.sub);

  const displayName = isFromClient
    ? comment.client?.name ||
      `${comment.client?.firstName || ""} ${comment.client?.lastName || ""}`.trim()
    : comment.user?.name ||
      `${comment.user?.firstName || ""} ${comment.user?.lastName || ""}`.trim();

  const handleEdit = () => {
    if (onEdit && isOwner) {
      onEdit(comment);
    }
  };

  const handleDelete = () => {
    if (onDelete && isOwner && comment.commentId) {
      Alert.alert(
        "Delete Comment",
        "Are you sure you want to delete this comment?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => onDelete(comment.commentId!),
          },
        ]
      );
    }
  };

  return (
    <View
      className={`mb-2 p-3 rounded-lg ${isFromClient ? "bg-[#c7f9cc]" : "bg-[#80ed99]"}`}
      style={{
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 3,
      }}
    >
      <View
        className={`flex-row ${isFromClient ? "justify-start" : "justify-end"} items-center`}
      >
        <View
          className={`flex-1 ml-2 ${isFromClient ? "items-start" : "items-end"}`}
        >
          <Text className="text-[#22577a] text-sm font-semibold mb-1">
            {displayName || "Unknown User"}
          </Text>
          <Text
            className={`text-[#22577a] ${isFromClient ? "text-left" : "text-right"}`}
          >
            {comment.text}
          </Text>
          {comment.createdAt && (
            <Text className="text-[#38a3a5] text-xs mt-1">
              {new Date(comment.createdAt).toLocaleString()}
            </Text>
          )}
        </View>
        {isOwner && (canEdit || canDelete) && (
          <View className="flex-row ml-1" style={{ gap: -4 }}>
            {canEdit && (
              <IconButton
                icon="pencil"
                iconColor="#38a3a5"
                size={16}
                style={{ margin: 0, padding: 0, marginRight: -6 }}
                onPress={handleEdit}
              />
            )}
            {canDelete && (
              <IconButton
                icon="delete"
                iconColor="#d32f2f"
                size={16}
                style={{ margin: 0, padding: 0, marginLeft: -6 }}
                onPress={handleDelete}
              />
            )}
          </View>
        )}
      </View>
    </View>
  );
};

export const CommentSection: React.FC<CommentSectionProps> = ({
  entityType,
  entityId,
  initialComments = [],
  isPrivate = false,
}) => {
  const { userInfo } = useAuthStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);

  useEffect(() => {
    // Handle initial comments or fetch from API
    if (initialComments && initialComments.length > 0) {
      setComments(initialComments);
    } else if (entityId) {
      // Only fetch if we don't have initial comments and entityId exists
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const result = await getCommentsByEntity(entityType, entityId);
          if (result.isSuccess) {
            setComments(result.data || []);
          } else {
            Toast.show({
              type: "error",
              text1: "Error",
              text2: `Failed to fetch comments: ${result.message}`,
              position: "top",
              topOffset: 100,
              visibilityTime: 4000,
              autoHide: true,
              props: {
                style: { zIndex: 9999 },
              },
            });
          }
        } catch (error) {
          console.error("Error fetching comments:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityType, entityId]); // initialComments intentionally excluded to prevent infinite loop

  useEffect(() => {
    // Update comments when initialComments change (separate effect)
    if (initialComments && initialComments.length > 0) {
      setComments(initialComments);
    }
  }, [initialComments]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const result = await getCommentsByEntity(entityType, entityId);
      if (result.isSuccess) {
        setComments(result.data || []);
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: `Failed to fetch comments: ${result.message}`,
          position: "top",
          topOffset: 100,
          visibilityTime: 4000,
          autoHide: true,
          props: {
            style: { zIndex: 9999 },
          },
        });
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newCommentText.trim()) {
      Toast.show({
        type: "warning",
        text1: "Warning",
        text2: "Please enter a comment",
        position: "top",
        topOffset: 100,
        visibilityTime: 4000,
        autoHide: true,
        props: {
          style: { zIndex: 9999 },
        },
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const newComment: Partial<Comment> = {
        text: newCommentText.trim(),
        entityType,
        entityId,
        isPrivate,
        clientId: userInfo?.sub,
        type: getCommentTypeFromEntityType(entityType),
      };

      const result = await addComment(newComment);
      if (result.isSuccess) {
        setNewCommentText("");
        await fetchComments();
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Comment added successfully",
          position: "top",
          topOffset: 100,
          visibilityTime: 4000,
          autoHide: true,
          props: {
            style: { zIndex: 9999 },
          },
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: `Failed to add comment: ${result.message}`,
          position: "top",
          topOffset: 100,
          visibilityTime: 4000,
          autoHide: true,
          props: {
            style: { zIndex: 9999 },
          },
        });
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditComment = async (comment: Comment) => {
    setEditingComment(comment);
    setNewCommentText(comment.text);
  };

  const handleUpdateComment = async () => {
    if (!editingComment || !newCommentText.trim()) return;

    setIsSubmitting(true);
    try {
      const updatedComment: Partial<Comment> = {
        text: newCommentText.trim(),
        isPrivate,
      };

      const result = await updateComment(editingComment.commentId!, {
        ...updatedComment,
        commentId: editingComment.commentId,
      });
      if (result.isSuccess) {
        setNewCommentText("");
        setEditingComment(null);
        await fetchComments();
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Comment updated successfully",
          position: "top",
          topOffset: 100,
          visibilityTime: 4000,
          autoHide: true,
          props: {
            style: { zIndex: 9999 },
          },
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: `Failed to update comment: ${result.message}`,
          position: "top",
          topOffset: 100,
          visibilityTime: 4000,
          autoHide: true,
          props: {
            style: { zIndex: 9999 },
          },
        });
      }
    } catch (error) {
      console.error("Error updating comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      const result = await deleteComment(commentId);
      if (result.isSuccess) {
        await fetchComments();
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Comment deleted successfully",
          position: "top",
          topOffset: 100,
          visibilityTime: 4000,
          autoHide: true,
          props: {
            style: { zIndex: 9999 },
          },
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: `Failed to delete comment: ${result.message}`,
          position: "top",
          topOffset: 100,
          visibilityTime: 4000,
          autoHide: true,
          props: {
            style: { zIndex: 9999 },
          },
        });
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const cancelEdit = () => {
    setEditingComment(null);
    setNewCommentText("");
  };

  const getCommentTypeFromEntityType = (
    entityType: EntityType
  ): CommentType => {
    switch (entityType) {
      case EntityType.GeneralComplain:
        return CommentType.GeneralComplain;
      case EntityType.LightpostComplain:
        return CommentType.LightpostComplain;
      case EntityType.ProjectComplain:
        return CommentType.ProjectComplain;
      case EntityType.GarbageComplain:
        return CommentType.GarbageComplain;
      default:
        return CommentType.GeneralComplain;
    }
  };

  console.log("Rendering CommentSection with comments:", comments[0]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center py-4">
        <ActivityIndicator animating={true} color={MD2Colors.blue500} />
      </View>
    );
  }

  return (
    <View className="flex-1">
      {/* Comments List - Takes 4/6 of available space */}
      <View className="h-4/6 ">
        {comments.length > 0 ? (
          <ScrollView
            contentContainerStyle={{ paddingVertical: 4 }}
            showsVerticalScrollIndicator={false}
          >
            {comments.map((comment) => (
              <CommentItem
                key={comment.commentId}
                comment={comment}
                onEdit={handleEditComment}
                onDelete={handleDeleteComment}
                canEdit={true}
                canDelete={true}
              />
            ))}
          </ScrollView>
        ) : (
          <View className="items-center justify-center py-8">
            <Text className="text-[#22577a] text-center">
              No comments yet. Be the first to comment!
            </Text>
          </View>
        )}
      </View>

      {/* Add/Edit Comment Section - Takes 2/6 of available space */}
      <View className="h-2/6 ">
        <Text className="font-semibold text-lg text-[#22577a] mb-2">
          {editingComment ? "Edit Comment" : "Add Comment"}
        </Text>
        <View>
          <TextInput
            value={newCommentText}
            multiline
            numberOfLines={2}
            onChangeText={setNewCommentText}
            placeholder="Type your comment here..."
            style={{
              color: "#22577a",
              backgroundColor: "#f6fff8",
              borderRadius: 8,
              borderColor: "#57cc99",
              borderWidth: 2,
              paddingHorizontal: 12,
              paddingVertical: 8,
              fontWeight: "bold",
              height: 60,
              textAlignVertical: "top",
            }}
          />
          <View className="flex-row justify-end mt-2" style={{ gap: 8 }}>
            {editingComment && (
              <Button
                mode="outlined"
                style={{ borderColor: "#38a3a5" }}
                labelStyle={{ color: "#38a3a5", fontWeight: "bold" }}
                onPress={cancelEdit}
                disabled={isSubmitting}
                compact
              >
                Cancel
              </Button>
            )}

            <Button
              icon={editingComment ? "check" : "plus"}
              mode="contained"
              style={{ backgroundColor: "#38a3a5" }}
              labelStyle={{ color: "#fff", fontWeight: "bold" }}
              onPress={editingComment ? handleUpdateComment : handleAddComment}
              disabled={isSubmitting || !newCommentText.trim()}
              loading={isSubmitting}
              compact
            >
              {/* {editingComment ? "Update" : "Add"} */}
              Comment
            </Button>
          </View>
        </View>
      </View>
    </View>
  );
};

export default CommentSection;
