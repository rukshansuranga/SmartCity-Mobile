import {
  addComment,
  deleteComment,
  getCommentsByEntity,
  updateComment,
} from "@/api/commentAction";
import { CommentType, EntityType } from "@/enums/enum";
import { useAuthStore } from "@/stores/authStore";
import { Comment } from "@/types";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Button, IconButton, MD2Colors, TextInput } from "react-native-paper";
import Toast from "react-native-toast-message";

interface CommentSectionProps {
  entityType: EntityType;
  entityId: string;
  initialComments?: Comment[];
  isPrivate?: boolean;
  onCommentAdded?: () => void;
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
  const isFromResident = comment.residentId && !comment.userId;
  const isFromUser = comment.userId && !comment.residentId;
  const isOwner =
    (isFromResident && comment.residentId === userInfo?.sub) ||
    (isFromUser && comment.userId === userInfo?.sub);

  const displayName = isFromResident
    ? comment.resident?.name ||
      `${comment.resident?.firstName || ""} ${comment.resident?.lastName || ""}`.trim()
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
        ],
      );
    }
  };

  return (
    <View
      className={`mb-2 p-3 rounded-lg ${isFromResident ? "bg-[#c7f9cc]" : "bg-[#80ed99]"}`}
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
      {/* Row for name and edit/delete icons */}
      <View
        className={`flex-row ${isFromResident ? "justify-end" : "justify-start"} items-center mb-1`}
      >
        <Text
          className={`text-[#22577a] text-sm font-semibold`}
          style={{ flexShrink: 1, marginRight: 8 }}
        >
          {displayName || "Unknown User"}
        </Text>
        {isOwner && (canEdit || canDelete) && (
          <View className="flex flex-row justify-end gap-5">
            {canEdit && (
              <IconButton
                icon="pencil"
                mode="contained"
                className="bg-[#57cc99]"
                size={16}
                style={{ margin: 0, padding: 0, marginRight: -6 }}
                onPress={handleEdit}
              />
            )}
            {canDelete && (
              <IconButton
                icon="delete"
                mode="contained"
                className="bg-[#57cc99]"
                size={16}
                style={{ margin: 0, padding: 0, marginLeft: -6 }}
                onPress={handleDelete}
              />
            )}
          </View>
        )}
      </View>
      {/* Main content row */}
      <View
        className={`flex-row ${isFromResident ? "justify-end" : "justify-start"} items-center`}
      >
        <View
          className={`flex-1 ml-2 ${isFromResident ? "items-end" : "items-start"}`}
        >
          <Text
            className={`text-[#22577a] ${isFromResident ? "text-right" : "text-left"}`}
          >
            {comment.text}
          </Text>
          {comment.createdAt && (
            <Text className="text-[#38a3a5] text-xs mt-1">
              {new Date(comment.createdAt).toLocaleString()}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

export const CommentSection: React.FC<CommentSectionProps> = ({
  entityType,
  entityId,
  initialComments = [],
  isPrivate = false,
  onCommentAdded,
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

    // Dismiss keyboard before submitting
    Keyboard.dismiss();
    setIsSubmitting(true);
    try {
      const newComment: Partial<Comment> = {
        text: newCommentText.trim(),
        entityType,
        entityId,
        isPrivate,
        residentId: userInfo?.sub,
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
        // Trigger callback to close modal if provided
        if (onCommentAdded) {
          onCommentAdded();
        }
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

    // Dismiss keyboard before submitting
    Keyboard.dismiss();
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
    entityType: EntityType,
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
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="always"
    >
      {/* Comments List */}
      <View className="mb-3">
        {comments.length > 0 ? (
          <View style={{ maxHeight: 300 }}>
            <ScrollView
              contentContainerStyle={{ paddingVertical: 4 }}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
              keyboardShouldPersistTaps="handled"
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
          </View>
        ) : (
          <View className="items-center justify-center py-8">
            <Text className="text-[#22577a] text-center">
              No comments yet. Be the first to comment!
            </Text>
          </View>
        )}
      </View>

      {/* Add/Edit Comment Section - Fixed at bottom */}
      <View>
        <Text className="font-semibold text-lg text-[#22577a] mb-2">
          {editingComment ? "Edit Comment" : "Add Comment"}
        </Text>
        <View>
          <TextInput
            value={newCommentText}
            multiline
            mode="outlined"
            onChangeText={setNewCommentText}
            placeholder="Write a comment..."
            testID="comment-input"
            numberOfLines={3}
            style={{
              minHeight: 80,
              maxHeight: 120,
            }}
            contentStyle={{
              paddingTop: 8,
            }}
            outlineStyle={{
              borderColor: "#57cc99",
              borderWidth: 2,
              borderRadius: 8,
            }}
            textColor="#22577a"
            placeholderTextColor="#22577a80"
          />
          <View
            className="flex-row justify-end items-center mt-3"
            style={{ gap: 10 }}
          >
            {editingComment && (
              <Button
                mode="outlined"
                style={{ borderColor: "#38a3a5", borderWidth: 2 }}
                labelStyle={{
                  color: "#38a3a5",
                  fontWeight: "bold",
                  fontSize: 14,
                }}
                onPress={cancelEdit}
                disabled={isSubmitting}
                testID="cancel-comment-button"
              >
                Cancel
              </Button>
            )}

            <Button
              icon={editingComment ? "check" : "plus"}
              mode="contained"
              style={{ backgroundColor: "#38a3a5", paddingVertical: 2 }}
              labelStyle={{ color: "#fff", fontWeight: "bold", fontSize: 14 }}
              onPress={editingComment ? handleUpdateComment : handleAddComment}
              disabled={isSubmitting || !newCommentText.trim()}
              loading={isSubmitting}
              testID="send-comment-button"
            >
              {editingComment ? "Update" : "Add"}
            </Button>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default CommentSection;
