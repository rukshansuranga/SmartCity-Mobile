// This file has been replaced by ManageGeneralComplain.tsx. Please use that file for add/update logic.

import { uploadAttachmentsClient } from "@/api/attachmentActions";
import { addGeneralComplain } from "@/api/complainAction";
import AttachmentPicker from "@/components/AttachmentPicker";
import { EntityType, WorkpackageStatus } from "@/enums/enum"; // Adjust the import path as necessary
import { useAuthStore } from "@/stores/authStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  View,
} from "react-native";
import { Button, Checkbox, Text, TextInput } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { z } from "zod";

import { AttachmentUpload } from "../../../types";

export default function AddGeneralComplain() {
  const router = useRouter();
  const { userInfo } = useAuthStore();
  const [attachments, setAttachments] = useState<AttachmentUpload[]>([]);
  const [uploading, setUploading] = useState(false);

  // Zod schema
  const complainSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    isPrivate: z.boolean(),
    //attachments: z.array(z.any()).optional(), // Changed to accommodate AttachmentUpload[]
  });

  type ComplainForm = z.infer<typeof complainSchema>;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ComplainForm>({
    resolver: zodResolver(complainSchema),
    defaultValues: {
      title: "",
      description: "",
      isPrivate: true,
    },
  });

  async function onSubmit(data: ComplainForm) {
    console.log("🚀 [DEBUG] Starting addGeneralComplainHandler");
    console.log("👤 [DEBUG] UserInfo:", userInfo);
    console.log("📝 [DEBUG] Form values:", data);
    try {
      setUploading(true);
      const complain = {
        clientId: userInfo?.sub,
        subject: data.title,
        detail: data.description,
        isPrivate: data.isPrivate,
        status: WorkpackageStatus.New,
      };
      console.log("📤 [DEBUG] Complain object to send:", complain);
      const result = await addGeneralComplain(complain);
      console.log("📥 [DEBUG] API Response:", result);
      if (!result.isSuccess) {
        console.error(
          "❌ [DEBUG] Failed to add general complain:",
          result.message
        );
        console.error("🔍 [DEBUG] Error details:", result.errors);
        setUploading(false);
        return;
      }
      console.log("✅ [DEBUG] Complain added successfully:", result.data);

      // If attachments exist, upload them using uploadAttachmentsClient
      if (attachments.length > 0 && result.data?.complainId) {
        try {
          // attachments are already AttachmentUpload type

          const entityId = result.data.complainId;
          const uploadResult = await uploadAttachmentsClient(
            EntityType.GeneralComplain,
            entityId,
            attachments
          );
          // console.log("🚀 [DEBUG] Starting attachment upload");
          // console.log("👤 [DEBUG] UserInfo:", userInfo);
          // console.log("📝 [DEBUG] Attachments to upload:", attachments[0].file);
          // console.log(
          //   "🆔 [DEBUG] EntityType:",
          //   entityType,
          //   "EntityId:",
          //   entityId
          // );
          // const uploadResult = await uploadAttachment({
          //   entityType,
          //   entityId,
          //   file: attachments[0].file,
          // });

          if (!uploadResult.isSuccess) {
            console.error("❌ [DEBUG] Attachment upload failed", uploadResult);
          } else {
            console.log("✅ [DEBUG] Attachments uploaded", uploadResult);
          }
        } catch (err) {
          console.error("❌ [DEBUG] Error uploading attachments", err);
        }
      }

      setUploading(false);
      router.push({
        pathname: "/(complains)/general/GeneralComplainList",
        params: {
          isPrivate: data.isPrivate.toString(),
          random: Math.random() * 10000,
        },
      });
    } catch (error) {
      setUploading(false);
      console.error("Error adding general complain:", error);
      // Toast error is already shown by fetchWrapper
    }
  }

  console.log("Current attachments:", attachments);

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-[#c7f9cc]">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View className="flex-1 justify-center mx-4 gap-4">
            <View className="w-full mb-2">
              <Text className="font-bold text-xl text-[#22577a]">
                Comment Title
              </Text>
              <Controller
                control={control}
                name="title"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    placeholder="Enter your complain"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    style={{
                      color: "#22577a",
                      backgroundColor: "#f6fff8",
                      borderRadius: 8,
                      borderColor: "#57cc99",
                      borderWidth: 2,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      fontWeight: "bold",
                    }}
                  />
                )}
              />
              {errors.title && (
                <Text style={{ color: "#e63946", fontSize: 12 }}>
                  {errors.title.message}
                </Text>
              )}
            </View>
            <View className="w-full mb-2">
              <Text className="font-bold text-xl text-[#22577a]">
                Description
              </Text>
              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    placeholder="Enter Description"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    style={{
                      color: "#22577a",
                      backgroundColor: "#f6fff8",
                      borderRadius: 8,
                      borderColor: "#57cc99",
                      borderWidth: 2,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      fontWeight: "bold",
                    }}
                  />
                )}
              />
              {errors.description && (
                <Text style={{ color: "#e63946", fontSize: 12 }}>
                  {errors.description.message}
                </Text>
              )}
            </View>
            <View className="flex-row items-center mb-4">
              <Controller
                control={control}
                name="isPrivate"
                render={({ field: { value, onChange } }) => (
                  <Checkbox
                    status={value ? "checked" : "unchecked"}
                    onPress={() => onChange(!value)}
                    color="#38a3a5"
                  />
                )}
              />
              <Text className="ml-2 text-[#22577a] font-bold">Is Private</Text>
            </View>
            <AttachmentPicker
              attachments={attachments}
              onChange={setAttachments}
              maxAttachments={5}
            />
            <View>
              <Button
                onPress={handleSubmit(onSubmit)}
                mode="contained"
                style={{ backgroundColor: "#38a3a5" }}
                labelStyle={{ color: "#fff", fontWeight: "bold" }}
                className="mt-5"
                loading={uploading}
                disabled={uploading}
              >
                {uploading ? "Submitting..." : "Add Complain"}
              </Button>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
