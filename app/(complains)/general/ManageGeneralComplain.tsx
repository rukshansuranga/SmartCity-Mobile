import {
  getAttachmentsClient,
  UpdateAttachments,
  uploadAttachmentsClient,
} from "@/api/attachmentActions";
import {
  addGeneralComplain,
  getGeneralComplainById,
  updateGeneralComplain,
} from "@/api/complainAction";
import MediaPicker from "@/components/MediaPicker";
import { EntityType, WorkpackageStatus } from "@/enums/enum";
import { useAuthStore } from "@/stores/authStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  View,
} from "react-native";
import { Button, Checkbox, Text, TextInput } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { z } from "zod";
import { AttachmentUpload } from "../../../types";

export default function ManageGeneralComplain() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { userInfo } = useAuthStore();
  const [attachments, setAttachments] = useState<AttachmentUpload[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [complainId, setComplainId] = useState<number | null>(null);

  // Determine initial isPrivate from params if present
  let initialIsPrivate = true;
  if (params && typeof params.isPrivate === "string") {
    initialIsPrivate = params.isPrivate === "true";
  }

  // Zod schema
  const complainSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    isPrivate: z.boolean(),
  });

  type ComplainForm = z.infer<typeof complainSchema>;

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ComplainForm>({
    resolver: zodResolver(complainSchema),
    defaultValues: {
      title: "",
      description: "",
      isPrivate: initialIsPrivate,
    },
  });

  // Load for update mode
  useEffect(() => {
    if (params && params.complainId) {
      setIsUpdate(true);
      const id = Number(params.complainId);
      setComplainId(id);
      (async () => {
        const res = await getGeneralComplainById(id);
        if (res.isSuccess && res.data) {
          setValue("title", res.data.subject || "");
          setValue("description", res.data.detail || "");
          setValue("isPrivate", res.data.isPrivate ?? true);
          const attRes = await getAttachmentsClient(
            EntityType.GeneralComplain,
            id
          );
          if (attRes.isSuccess && attRes.data) {
            setAttachments(
              attRes.data.map((a) => ({
                file: {
                  uri: a.thumbnailUrl || a.sourceUrl || "",
                  name: a.fileName,
                  type: a.contentType || "application/octet-stream",
                },
                description: a.description,
                attachmentType: a.attachmentType,
                category: a.category,
                attachmentId: a.attachmentId,
                thumbnailUrl: a.thumbnailUrl,
                sourceUrl: a.sourceUrl,
              }))
            );
          }
        }
      })();
    }
  }, [params?.complainId]);

  async function onSubmit(data: ComplainForm) {
    setUploading(true);
    try {
      let result;
      let id = complainId;
      if (isUpdate && id) {
        const complain = {
          complainId: id,
          subject: data.title,
          detail: data.description,
          isPrivate: data.isPrivate,
          status: WorkpackageStatus.New,
          residentId: userInfo?.sub,
          resident: {
            residentId: userInfo?.sub,
            firstName: userInfo?.firstName,
            lastName: userInfo?.lastName,
            mobile: userInfo?.mobile,
          },
        };

        console.log("🚀 [DEBUG] Updating complain with ID:", id, complain);

        result = await updateGeneralComplain(id, complain);
      } else {
        const complain = {
          residentId: userInfo?.sub,
          subject: data.title,
          detail: data.description,
          isPrivate: data.isPrivate,
          status: WorkpackageStatus.New,
        };
        result = await addGeneralComplain(complain);
        id = result.data?.complainId;
      }

      if (!result.isSuccess) {
        setUploading(false);
        return;
      }

      // If attachments exist, upload them using uploadAttachmentsClient
      if (attachments.length > 0 && id) {
        try {
          const entityId = id;

          const shouldAddedAttachments = attachments.filter(
            (a) => !a.attachmentId
          );

          const shouldUpdateAttachments = attachments.filter(
            (a) => a.attachmentId
          );

          console.log(12333333333333333333333333, shouldUpdateAttachments);

          await UpdateAttachments(shouldUpdateAttachments);

          const uploadResult = await uploadAttachmentsClient(
            EntityType.GeneralComplain,
            entityId,
            shouldAddedAttachments
          );
          if (!uploadResult.isSuccess) {
            console.error("❌ [DEBUG] Attachment upload failed", uploadResult);
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
        },
      });
    } catch (error) {
      setUploading(false);
      console.error("Error managing general complain:", error);
    }
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-[#c7f9cc]">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View className="flex-1 justify-between p-1">
            <ScrollView>
              <View className="w-full my-2">
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
                <Controller
                  control={control}
                  name="description"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      placeholder="Enter Description"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      multiline
                      numberOfLines={4}
                      style={{
                        color: "#22577a",
                        backgroundColor: "#f6fff8",
                        borderRadius: 8,
                        borderColor: "#57cc99",
                        borderWidth: 2,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        textAlignVertical: "top",
                        minHeight: 100,
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
                <Text className="ml-2 text-[#22577a] font-bold">
                  Is Private
                </Text>
              </View>
              <MediaPicker
                attachments={attachments}
                onChange={setAttachments}
                maxAttachments={5}
              />
            </ScrollView>
            <View>
              <Button
                onPress={handleSubmit(onSubmit)}
                mode="contained"
                style={{ backgroundColor: "#38a3a5" }}
                labelStyle={{ color: "#fff", fontWeight: "bold" }}
                className="mt-2"
                loading={uploading}
                disabled={uploading}
              >
                {uploading
                  ? isUpdate
                    ? "Updating..."
                    : "Submitting..."
                  : isUpdate
                    ? "Update Complain"
                    : "Add Complain"}
              </Button>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
