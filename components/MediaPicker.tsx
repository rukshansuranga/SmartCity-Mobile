import { MaterialIcons } from "@expo/vector-icons";
import { Audio, Video } from "expo-av";

import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  Alert,
  FlatList,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { deleteAttachment } from "../api/attachmentActions";
import { AttachmentUpload } from "../types";
import AttachmentThumbnail from "./AttachmentThumbnail";

type Props = {
  attachments: AttachmentUpload[];
  onChange: (attachments: AttachmentUpload[]) => void;
  maxAttachments?: number;
};

const MediaPicker: React.FC<Props> = ({
  attachments,
  onChange,
  maxAttachments = 5,
}) => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  // Capture voice (audio)
  const captureVoice = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Microphone permission is required to record audio."
        );
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      await rec.startAsync();
      setRecording(rec);
      Alert.alert("Recording...", "Tap OK to stop recording.", [
        {
          text: "OK",
          onPress: async () => {
            try {
              await rec.stopAndUnloadAsync();
              const uri = rec.getURI();
              if (uri) {
                const file = {
                  uri,
                  name: `Voice_${Date.now()}.m4a`,
                  type: "audio/m4a",
                };
                onChange([
                  ...attachments,
                  {
                    file,
                    attachmentType: "Audio",
                  },
                ]);
              }
              setRecording(null);
            } catch {
              Alert.alert("Error", "Failed to save audio recording.");
              setRecording(null);
            }
          },
        },
      ]);
    } catch {
      Alert.alert("Error", "Failed to start audio recording.");
      setRecording(null);
    }
  };
  // ...existing code...
  // Pick a video from the gallery
  const pickVideo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const file = {
        uri: asset.uri,
        name: asset.fileName || "Video",
        type: asset.mimeType || "video",
      };
      onChange([
        ...attachments,
        {
          file,
          attachmentType: "Video",
        },
      ]);
    }
  };

  // Capture a new video
  const captureVideo = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Camera permission is required to record a video."
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const file = {
        uri: asset.uri,
        name: asset.fileName || "Video",
        type: asset.mimeType || "video",
      };
      onChange([
        ...attachments,
        {
          file,
          attachmentType: "Video",
        },
      ]);
    }
  };

  // Pick an image from the gallery
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      try {
        await fetch(asset.uri);
        const fileName = asset.fileName || "Image";
        const fileType = asset.mimeType || "image";
        const file = {
          uri: asset.uri,
          name: fileName,
          type: fileType,
        };
        onChange([
          ...attachments,
          {
            file,
            description: "",
          },
        ]);
      } catch (e) {
        console.error("Failed to fetch image blob", e);
      }
    }
  };

  // Capture a photo using the camera
  const capturePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Camera permission is required to take a photo."
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      try {
        await fetch(asset.uri);
        const fileName = asset.fileName || "Photo";
        const fileType = asset.mimeType || "image/jpeg";
        const file = {
          uri: asset.uri,
          name: fileName,
          type: fileType,
        };
        onChange([
          ...attachments,
          {
            file,
            description: "",
          },
        ]);
      } catch (e) {
        console.error("Failed to fetch captured photo blob", e);
      }
    }
  };

  // Pick a document (any file)
  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      try {
        await fetch(asset.uri);
        const fileName = asset.name || "File";
        const fileType = asset.mimeType || "file";
        const file = {
          uri: asset.uri,
          name: fileName,
          type: fileType,
        };
        onChange([
          ...attachments,
          {
            file,
            description: "",
          },
        ]);
      } catch (e) {
        console.error("Failed to fetch document blob", e);
      }
    }
  };

  // Remove an attachment by index
  const removeAttachment = async (index: number, attachmentId?: number) => {
    const updated = attachments.filter((_, i) => i !== index);
    if (attachmentId) {
      try {
        await deleteAttachment(attachmentId);
      } catch (e) {
        console.error("Failed to remove attachment", e);
      }
    }
    onChange(updated);
  };

  // Remove a video by index in the filtered video list
  const removeVideo = async (videoIndex: number, attachmentId?: number) => {
    // Find the index of the video in the attachments array
    let videoCount = -1;
    const updated = attachments.filter((att) => {
      if (att.attachmentType === "Video") {
        videoCount++;
        return videoCount !== videoIndex;
      }
      return true;
    });

    if (attachmentId) {
      try {
        await deleteAttachment(attachmentId);
      } catch (e) {
        console.error("Failed to remove attachment", e);
      }
    }
    onChange(updated);
  };

  // Update the description for an attachment (local state)
  const updateAttachmentDescription = (index: number, value: string) => {
    const updated = attachments.map((att, i) =>
      i === index ? { ...att, description: value } : att
    );
    onChange(updated);
  };

  function getUri(item) {
    return item.attachmentId ? item.sourceUrl : item.file.uri;
  }

  console.log("🚀 [DEBUG] attachments:", attachments);

  return (
    <View className="my-2">
      <View className="flex-row mb-2 pl-2 flex-wrap justify-start gap-2">
        <TouchableOpacity
          className={`max-w-[110px] bg-[#38a3a5] rounded-xl mr-1.5 shadow-md items-center py-2 px-3 ${attachments.length >= maxAttachments ? "opacity-50" : ""}`}
          onPress={pickImage}
          disabled={attachments.length >= maxAttachments}
        >
          <View className="flex-row items-center justify-center">
            <MaterialIcons name="photo-library" size={24} color="#fff" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          className={`max-w-[110px] bg-[#22577a] rounded-xl mx-0.5 shadow-md items-center py-2 px-3 ${attachments.length >= maxAttachments ? "opacity-50" : ""}`}
          onPress={capturePhoto}
          disabled={attachments.length >= maxAttachments}
        >
          <View className="flex-row items-center justify-center">
            <MaterialIcons name="photo-camera" size={24} color="#fff" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          className={`max-w-[110px] bg-[#57cc99] rounded-xl ml-1.5 shadow-md items-center py-2 px-3 ${attachments.length >= maxAttachments ? "opacity-50" : ""}`}
          onPress={pickDocument}
          disabled={attachments.length >= maxAttachments}
        >
          <View className="flex-row items-center justify-center">
            <MaterialIcons name="attach-file" size={24} color="#fff" />
          </View>
        </TouchableOpacity>
        {/* Video Buttons */}
        <TouchableOpacity
          className="max-w-[110px] bg-[#f7b801] rounded-xl ml-1.5 shadow-md items-center py-2 px-3"
          onPress={pickVideo}
        >
          <View className="flex-row items-center justify-center">
            <MaterialIcons name="video-library" size={24} color="#fff" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          className="max-w-[110px] bg-[#f95d6a] rounded-xl ml-1.5 shadow-md items-center py-2 px-3"
          onPress={captureVideo}
        >
          <View className="flex-row items-center justify-center">
            <MaterialIcons name="videocam" size={24} color="#fff" />
          </View>
        </TouchableOpacity>
        {/* Voice Capture Button */}
        <TouchableOpacity
          className={`max-w-[110px] bg-[#3a86ff] rounded-xl ml-1.5 shadow-md items-center py-2 px-3 ${attachments.length >= maxAttachments ? "opacity-50" : ""}`}
          onPress={captureVoice}
          disabled={attachments.length >= maxAttachments}
        >
          <View className="flex-row items-center justify-center">
            <MaterialIcons name="mic" size={24} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Images & Files List (exclude videos and audio) */}
      <FlatList
        data={attachments.filter(
          (att) =>
            att.attachmentType !== "Video" && att.attachmentType !== "Audio"
        )}
        keyExtractor={(_, idx) => idx.toString()}
        renderItem={({ item, index }) => (
          <View className="mb-2 mt-1 flex-row items-center relative mr-2 bg-[#c7f9cc] border border-[#57cc99] rounded-lg p-2">
            <AttachmentThumbnail item={item} />
            {/* Voice Attachments Row */}
            {attachments.some((att) => att.attachmentType === "Audio") && (
              <View className="mt-2">
                <Text className="text-[#22577a] font-bold mb-2">
                  Voice Notes
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ flexDirection: "row" }}
                >
                  {attachments
                    .filter((att) => att.attachmentType === "Audio")
                    .map((item, idx) => (
                      <View
                        key={idx}
                        className="flex-col items-center mr-4 bg-[#e0e7ff] rounded-lg p-2 min-w-[100px]"
                      >
                        <TouchableOpacity
                          onPress={async () => {
                            try {
                              const { sound } = await Audio.Sound.createAsync({
                                uri: item.file.uri,
                              });
                              await sound.playAsync();
                            } catch {
                              Alert.alert("Error", "Failed to play audio.");
                            }
                          }}
                          className="mb-1"
                          accessibilityLabel="Play voice note"
                        >
                          <MaterialIcons
                            name="play-arrow"
                            size={32}
                            color="#3a86ff"
                          />
                        </TouchableOpacity>
                        <Text
                          className="text-xs text-center text-[#22577a]"
                          numberOfLines={1}
                          style={{ maxWidth: 80 }}
                        >
                          {item.file?.name || "Voice Note"}
                        </Text>
                        <TouchableOpacity
                          className="bg-[#f95d6a] rounded-full p-1 mt-1"
                          onPress={() =>
                            removeAttachment(
                              attachments.indexOf(item),
                              item?.attachmentId
                            )
                          }
                          accessibilityLabel="Remove voice note"
                        >
                          <MaterialIcons name="delete" size={15} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    ))}
                </ScrollView>
              </View>
            )}
            <View className="flex-1 ml-2 min-w-[100px]">
              <Text
                className="w-20 text-center text-xs mt-1 mb-1 text-[#22577a] font-bold"
                numberOfLines={1}
              >
                {item.file?.name || "File"}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <TextInput
                  className="w-full border border-[#57cc99] rounded bg-[#f6fff8] px-1 text-xs mb-1 min-h-[24px] max-h-[80px] text-[#22577a]"
                  value={item.description || ""}
                  onChangeText={(text) =>
                    updateAttachmentDescription(index, text)
                  }
                  placeholder="Description"
                  placeholderTextColor="#38a3a5"
                  multiline
                  textAlignVertical="top"
                  numberOfLines={2}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
            <View
              style={{
                position: "absolute",
                top: 2,
                right: 2,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <View className="flex-1 flex-row"></View>

              <TouchableOpacity
                className="bg-[#f95d6a] rounded-full p-1 "
                onPress={() => removeAttachment(index, item?.attachmentId)}
                accessibilityLabel="Remove attachment"
              >
                <MaterialIcons name="delete" size={15} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Video List */}
      {attachments.some((att) => att.attachmentType === "Video") && (
        <View className="mt-4">
          <Text className="text-[#22577a] font-bold mb-2">Videos</Text>
          <FlatList
            data={attachments.filter((att) => att.attachmentType === "Video")}
            keyExtractor={(_, idx) => `video-${idx}`}
            renderItem={({ item, index }) => (
              <View
                style={{
                  width: "100%",
                  aspectRatio: 16 / 9,
                  marginBottom: 16,
                  position: "relative",
                }}
              >
                <Video
                  source={{ uri: getUri(item) }}
                  useNativeControls
                  resizeMode={"contain" as any}
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 12,
                    backgroundColor: "#000",
                  }}
                />
                {/* Delete button at top right */}
                <TouchableOpacity
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    backgroundColor: "#f95d6a",
                    borderRadius: 16,
                    padding: 6,
                    zIndex: 2,
                  }}
                  onPress={() => removeVideo(index, item?.attachmentId)}
                  accessibilityLabel="Remove video"
                >
                  <MaterialIcons name="delete" size={20} color="#fff" />
                </TouchableOpacity>
                <Text className="text-xs text-center mt-1 text-[#22577a]">
                  {item.file?.name || "Video"}
                </Text>
              </View>
            )}
            horizontal={false}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}
    </View>
  );
};

export default MediaPicker;
