import { uploadAttachmentsClient } from "@/api/attachmentActions";
import {
  addInfrastructureComplaint,
  getAssetById,
  getComplaintsByAsset,
} from "@/api/infrastructureAction";
import MediaPicker from "@/components/MediaPicker";
import ComplaintTemplateSelector from "@/components/infrastructure/ComplaintTemplateSelector";
import {
  ASSET_COLORS,
  ASSET_ICONS,
  ASSET_TYPE_NAMES,
} from "@/config/assetConfig";
import { EntityType } from "@/enums/enum";
import { useAuthStore } from "@/stores/authStore";
import { AttachmentUpload } from "@/types";
import {
  AssetType,
  InfrastructureAsset,
  InfrastructureComplaint,
  getInfrastructureTypeValue,
} from "@/types/infrastructure";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  View,
} from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { z } from "zod";

export default function CreateInfrastructureComplaint() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { userInfo } = useAuthStore();

  const [attachments, setAttachments] = useState<AttachmentUpload[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null,
  );
  const [asset, setAsset] = useState<InfrastructureAsset | null>(null);
  const [existingComplaints, setExistingComplaints] = useState<
    InfrastructureComplaint[]
  >([]);
  const [loading, setLoading] = useState(true);

  const assetId = params.assetId as string;

  console.log("Selected asset ID:", assetId);

  // Helper to convert assetType string to number
  const getAssetTypeNumber = (assetType: any): number => {
    return typeof assetType === "number"
      ? assetType
      : AssetType[assetType as keyof typeof AssetType];
  };

  // Zod schema
  const complainSchema = z.object({
    subject: z.string().min(1, "Subject is required"),
    description: z.string().optional(),
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
      subject: "",
      description: "",
    },
  });

  // Load asset details
  useEffect(() => {
    const loadAsset = async () => {
      try {
        setLoading(true);
        const result = await getAssetById(assetId);
        if (result.isSuccess && result.data) {
          setAsset(result.data);
        } else {
          console.error("Failed to load asset:", result.message);
        }

        // Load existing complaints for this asset
        const complaintsResult = await getComplaintsByAsset(assetId);
        if (complaintsResult.isSuccess && complaintsResult.data) {
          setExistingComplaints(complaintsResult.data);
        }
      } catch (error) {
        console.error("Error loading asset:", error);
      } finally {
        setLoading(false);
      }
    };

    if (assetId) {
      loadAsset();
    }
  }, [assetId]);

  const handleTemplateSelect = (templateId: string, subject: string) => {
    setSelectedTemplateId(templateId);
    setValue("subject", subject);

    // If it's "other" template (no subject), clear the field
    if (!subject) {
      setValue("subject", "");
    }
  };

  async function onSubmit(data: ComplainForm) {
    if (!asset) return;

    // Validation: If "Other" is selected, both subject and description required
    const isOtherTemplate = selectedTemplateId?.includes("_other");
    if (isOtherTemplate && !data.description) {
      alert("Please provide a description for your complaint");
      return;
    }

    if (!selectedTemplateId) {
      alert("Please select a complaint type");
      return;
    }

    setUploading(true);
    try {
      const assetTypeKey = getAssetTypeNumber(asset.assetType);
      const infrastructureType = getInfrastructureTypeValue(assetTypeKey);

      console.log("assetType:", asset.assetType);
      console.log("assetTypeKey:", assetTypeKey);
      console.log("infrastructureType", infrastructureType);

      const complaint = {
        subject: data.subject,
        detail: data.description || "",
        status: 0, // New
        assetId: asset.assetId,
        infrastructureType,
        residentId: userInfo?.sub,
      };

      console.log("Creating infrastructure complaint:", complaint);

      const result = await addInfrastructureComplaint(complaint);

      if (!result.isSuccess) {
        console.error("Failed to create complaint:", result.message);
        setUploading(false);
        return;
      }

      console.log("Complaint created successfully:", result.data);

      // Upload attachments if any
      if (attachments.length > 0 && result.data?.complainId) {
        try {
          const uploadResult = await uploadAttachmentsClient(
            EntityType.InfrastructureComplain,
            result.data.complainId,
            attachments,
          );

          if (!uploadResult.isSuccess) {
            console.error("Attachment upload failed", uploadResult);
          } else {
            console.log("Attachments uploaded successfully");
          }
        } catch (err) {
          console.error("Error uploading attachments", err);
        }
      }

      setUploading(false);

      // Navigate back to asset detail or infrastructure list
      router.back();
    } catch (error) {
      setUploading(false);
      console.error("Error creating complaint:", error);
    }
  }

  if (loading || !asset) {
    return (
      <SafeAreaProvider>
        <SafeAreaView className="flex-1 bg-[#c7f9cc] justify-center items-center">
          <Text>Loading asset details...</Text>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  // Convert assetType to number
  const assetTypeKey = getAssetTypeNumber(asset.assetType);

  const assetTypeName = ASSET_TYPE_NAMES[assetTypeKey];
  const assetColor = ASSET_COLORS[assetTypeKey];

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-[#c7f9cc]">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView className="flex-1">
            <View className="p-4">
              {/* Asset Header */}
              <View
                className="bg-white rounded-xl p-4 mb-4"
                style={{ borderLeftWidth: 4, borderLeftColor: assetColor }}
              >
                <View className="flex-row items-center">
                  <Text className="text-4xl mr-3">
                    {ASSET_ICONS[assetTypeKey]}
                  </Text>
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-[#1F2937]">
                      {asset.assetName}
                    </Text>
                    {asset.assetCode && (
                      <Text className="text-sm text-[#6B7280]">
                        {asset.assetCode}
                      </Text>
                    )}
                    <Text className="text-xs text-[#6B7280] mt-1">
                      {assetTypeName}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Template Selector */}
              <View className="bg-white rounded-xl p-4 mb-4">
                <ComplaintTemplateSelector
                  assetType={assetTypeKey}
                  selectedTemplateId={selectedTemplateId}
                  onSelectTemplate={handleTemplateSelect}
                  existingComplaints={existingComplaints}
                />
              </View>

              {/* Subject Input (for "Other" option) */}
              {selectedTemplateId?.includes("_other") && (
                <View className="bg-white rounded-xl p-4 mb-4">
                  <Text className="font-bold text-lg text-[#1F2937] mb-2">
                    Subject
                  </Text>
                  <Controller
                    control={control}
                    name="subject"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        placeholder="Enter the subject of your complaint"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        mode="outlined"
                        error={!!errors.subject}
                        style={{ backgroundColor: "#fff" }}
                      />
                    )}
                  />
                  {errors.subject && (
                    <Text className="text-red-500 text-sm mt-1">
                      {errors.subject.message}
                    </Text>
                  )}
                </View>
              )}

              {/* Description */}
              <View className="mb-4">
                <Text className="font-bold text-lg text-[#22577a] mb-2">
                  Description{" "}
                  {selectedTemplateId?.includes("_other") && "(Required)"}
                </Text>
                <Controller
                  control={control}
                  name="description"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      placeholder="Provide additional details about the issue"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      mode="outlined"
                      multiline
                      numberOfLines={4}
                      style={{ backgroundColor: "#fff" }}
                    />
                  )}
                />
              </View>

              {/* Attachments */}
              <View className="mb-4">
                <Text className="font-bold text-lg text-[#22577a] mb-2">
                  Attachments (Optional)
                </Text>
                <MediaPicker
                  attachments={attachments}
                  onChange={setAttachments}
                  maxAttachments={5}
                />
              </View>

              {/* Submit Button */}
              <Button
                mode="contained"
                onPress={handleSubmit(onSubmit)}
                loading={uploading}
                disabled={uploading || !selectedTemplateId}
                style={{
                  backgroundColor: assetColor,
                  paddingVertical: 8,
                  borderRadius: 8,
                }}
                labelStyle={{ fontSize: 18, fontWeight: "600" }}
              >
                {uploading ? "Submitting..." : "Submit Complaint"}
              </Button>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
