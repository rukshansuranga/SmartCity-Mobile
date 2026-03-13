import { deleteAttachment } from "@/api/attachmentActions";
import { Attachment } from "@/types";
import { MaterialIcons } from "@expo/vector-icons";
import { ResizeMode, Video } from "expo-av";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button } from "react-native-paper";
import { WebView } from "react-native-webview";

interface ExistingAttachmentsGridProps {
  attachments: Attachment[];
  canDelete?: boolean;
  onAttachmentDeleted?: () => void;
}

const ExistingAttachmentsGrid: React.FC<ExistingAttachmentsGridProps> = ({
  attachments,
  canDelete = false,
  onAttachmentDeleted,
}) => {
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());
  const [previewVisible, setPreviewVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { width, height } = Dimensions.get("window");

  const openPreview = (index: number) => {
    setSelectedIndex(index);
    setPreviewVisible(true);
  };

  const closePreview = () => {
    setPreviewVisible(false);
  };

  const navigatePreview = (direction: "next" | "prev") => {
    if (direction === "next" && selectedIndex < attachments.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    } else if (direction === "prev" && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const handleDelete = (attachment: Attachment) => {
    Alert.alert(
      "Delete Attachment",
      `Are you sure you want to delete "${attachment.originalFileName}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeletingIds((prev) =>
              new Set(prev).add(attachment.attachmentId),
            );
            try {
              const result = await deleteAttachment(attachment.attachmentId);
              if (result.isSuccess) {
                Alert.alert("Success", "Attachment deleted successfully");
                if (onAttachmentDeleted) {
                  onAttachmentDeleted();
                }
              } else {
                Alert.alert(
                  "Error",
                  result.message || "Failed to delete attachment",
                );
              }
            } catch (error) {
              console.error("Error deleting attachment:", error);
              Alert.alert("Error", "Failed to delete attachment");
            } finally {
              setDeletingIds((prev) => {
                const newSet = new Set(prev);
                newSet.delete(attachment.attachmentId);
                return newSet;
              });
            }
          },
        },
      ],
    );
  };

  const renderThumbnail = (attachment: Attachment, index: number) => {
    const isImage = attachment.contentType?.startsWith("image");
    const isVideo = attachment.contentType?.startsWith("video");
    const isPdf = attachment.contentType === "application/pdf";
    const isDeleting = deletingIds.has(attachment.attachmentId);

    return (
      <TouchableOpacity
        key={attachment.attachmentId}
        onPress={() => openPreview(index)}
        activeOpacity={0.8}
        disabled={isDeleting}
        style={{
          width: "31%",
          aspectRatio: 1,
          margin: "1%",
          borderRadius: 8,
          overflow: "hidden",
          backgroundColor: "#F3F4F6",
          opacity: isDeleting ? 0.5 : 1,
        }}
      >
        {/* Thumbnail */}
        {isImage && attachment.thumbnailUrl ? (
          <Image
            source={{ uri: attachment.thumbnailUrl }}
            style={{
              width: "100%",
              height: "100%",
            }}
            resizeMode="cover"
          />
        ) : isVideo ? (
          <View
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "#1F2937",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MaterialIcons name="play-circle-outline" size={40} color="#fff" />
            <Text style={{ color: "#fff", fontSize: 10, marginTop: 4 }}>
              VIDEO
            </Text>
          </View>
        ) : isPdf ? (
          <View
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "#EF4444",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MaterialIcons name="picture-as-pdf" size={40} color="#fff" />
            <Text style={{ color: "#fff", fontSize: 10, marginTop: 4 }}>
              PDF
            </Text>
          </View>
        ) : (
          <View
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "#6B7280",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MaterialIcons name="insert-drive-file" size={40} color="#fff" />
            <Text style={{ color: "#fff", fontSize: 10, marginTop: 4 }}>
              FILE
            </Text>
          </View>
        )}

        {/* Delete button overlay */}
        {canDelete && !isDeleting && (
          <TouchableOpacity
            onPress={(e) => {
              e?.stopPropagation?.();
              handleDelete(attachment);
            }}
            style={{
              position: "absolute",
              top: 4,
              right: 4,
              backgroundColor: "#EF4444",
              borderRadius: 12,
              width: 24,
              height: 24,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MaterialIcons name="close" size={16} color="#fff" />
          </TouchableOpacity>
        )}

        {/* Deleting indicator */}
        {isDeleting && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#fff", fontSize: 12 }}>Deleting...</Text>
          </View>
        )}

        {/* File name */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            padding: 4,
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 10,
              textAlign: "center",
            }}
            numberOfLines={1}
            ellipsizeMode="middle"
          >
            {attachment.originalFileName}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (attachments.length === 0) {
    return null;
  }

  return (
    <View>
      <Text className="font-bold text-lg text-[#22577a] mb-2">
        Existing Attachments ({attachments.length})
      </Text>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          marginBottom: 16,
        }}
      >
        {attachments.map((attachment, index) =>
          renderThumbnail(attachment, index),
        )}
      </View>

      {/* Preview Modal */}
      <Modal
        visible={previewVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closePreview}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.95)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* Close button */}
          <TouchableOpacity
            onPress={closePreview}
            style={{
              position: "absolute",
              top: 50,
              right: 20,
              zIndex: 10,
              backgroundColor: "rgba(255,255,255,0.2)",
              borderRadius: 20,
              padding: 8,
            }}
          >
            <MaterialIcons name="close" size={30} color="#fff" />
          </TouchableOpacity>

          {/* Navigation buttons */}
          {selectedIndex > 0 && (
            <TouchableOpacity
              onPress={() => navigatePreview("prev")}
              style={{
                position: "absolute",
                left: 20,
                zIndex: 10,
                backgroundColor: "rgba(255,255,255,0.2)",
                borderRadius: 20,
                padding: 8,
              }}
            >
              <MaterialIcons name="chevron-left" size={40} color="#fff" />
            </TouchableOpacity>
          )}

          {selectedIndex < attachments.length - 1 && (
            <TouchableOpacity
              onPress={() => navigatePreview("next")}
              style={{
                position: "absolute",
                right: 20,
                zIndex: 10,
                backgroundColor: "rgba(255,255,255,0.2)",
                borderRadius: 20,
                padding: 8,
              }}
            >
              <MaterialIcons name="chevron-right" size={40} color="#fff" />
            </TouchableOpacity>
          )}

          {/* Content */}
          {attachments[selectedIndex] &&
            (() => {
              const currentAttachment = attachments[selectedIndex];
              const isImage =
                currentAttachment.contentType?.startsWith("image");
              const isVideo =
                currentAttachment.contentType?.startsWith("video");
              const isPdf = currentAttachment.contentType === "application/pdf";

              if (isImage && currentAttachment.sourceUrl) {
                return (
                  <Image
                    source={{ uri: currentAttachment.sourceUrl }}
                    style={{
                      width: width,
                      height: height * 0.7,
                    }}
                    resizeMode="contain"
                  />
                );
              } else if (isVideo && currentAttachment.sourceUrl) {
                // Video playback using expo-av
                return (
                  <Video
                    source={{ uri: currentAttachment.sourceUrl }}
                    style={{
                      width: width,
                      height: height * 0.7,
                    }}
                    useNativeControls
                    resizeMode={ResizeMode.CONTAIN}
                    isLooping={false}
                    shouldPlay={false}
                  />
                );
              } else if (isPdf) {
                // PDF preview using WebView
                return (
                  <View
                    style={{
                      flex: 1,
                      width: width * 0.9,
                      height: height * 0.7,
                    }}
                  >
                    <WebView
                      source={{ uri: currentAttachment.sourceUrl }}
                      style={{ flex: 1, backgroundColor: "#fff" }}
                      startInLoadingState={true}
                      renderLoading={() => (
                        <View
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#000",
                          }}
                        >
                          <MaterialIcons
                            name="picture-as-pdf"
                            size={100}
                            color="#fff"
                          />
                          <Text style={{ color: "#fff", marginTop: 20 }}>
                            Loading PDF...
                          </Text>
                        </View>
                      )}
                    />
                  </View>
                );
              } else {
                return (
                  <View
                    style={{
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <MaterialIcons
                      name="insert-drive-file"
                      size={100}
                      color="#fff"
                    />
                    <Text
                      style={{ color: "#fff", marginTop: 20, fontSize: 18 }}
                    >
                      {currentAttachment.originalFileName}
                    </Text>
                    <Text style={{ color: "#999", marginTop: 10 }}>
                      Preview not available for this file type
                    </Text>
                  </View>
                );
              }
            })()}

          {/* Info bar at bottom */}
          <View
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: "rgba(0,0,0,0.8)",
              padding: 20,
              paddingBottom: 40,
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 16,
                textAlign: "center",
                marginBottom: 10,
              }}
            >
              {attachments[selectedIndex]?.originalFileName}
            </Text>
            <Text
              style={{
                color: "#999",
                fontSize: 12,
                textAlign: "center",
                marginBottom: 16,
              }}
            >
              {selectedIndex + 1} of {attachments.length}
            </Text>

            {/* Delete button in preview */}
            {canDelete && attachments[selectedIndex] && (
              <Button
                mode="contained"
                onPress={() => {
                  closePreview();
                  handleDelete(attachments[selectedIndex]);
                }}
                style={{
                  backgroundColor: "#EF4444",
                  marginHorizontal: 40,
                }}
                icon="delete"
              >
                Delete Attachment
              </Button>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ExistingAttachmentsGrid;
