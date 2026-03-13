import {
  getAttachmentsClient,
  uploadAttachmentsClient,
} from "@/api/attachmentActions";
import {
  deleteInfrastructureComplaint,
  getAssetById,
  getComplaintsByAsset,
  getInfrastructureComplaintById,
  updateInfrastructureComplaint,
} from "@/api/infrastructureAction";
import ExistingAttachmentsGrid from "@/components/ExistingAttachmentsGrid";
import MediaPicker from "@/components/MediaPicker";
import ComplaintTemplateSelector from "@/components/infrastructure/ComplaintTemplateSelector";
import {
  ASSET_COLORS,
  ASSET_ICONS,
  ASSET_TYPE_NAMES,
  COMPLAINT_TEMPLATES,
} from "@/config/assetConfig";
import { ComplainStatus, EntityType } from "@/enums/enum";
import { useAuthStore } from "@/stores/authStore";
import { Attachment, AttachmentUpload } from "@/types";
import {
  AssetType,
  InfrastructureAsset,
  InfrastructureComplaint,
} from "@/types/infrastructure";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  View,
} from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { z } from "zod";

export default function EditInfrastructureComplaint() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { userInfo } = useAuthStore();

  const [attachments, setAttachments] = useState<AttachmentUpload[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<Attachment[]>(
    [],
  );
  const [existingComplaints, setExistingComplaints] = useState<
    InfrastructureComplaint[]
  >([]);
  const [originalComplaint, setOriginalComplaint] =
    useState<InfrastructureComplaint | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [asset, setAsset] = useState<InfrastructureAsset | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null,
  );

  const complainId = parseInt(params.complainId as string);

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

  // Load complaint and asset details
  useEffect(() => {
    const loadComplaint = async () => {
      try {
        setLoading(true);

        // Load complaint data
        const complaintResult =
          await getInfrastructureComplaintById(complainId);
        if (!complaintResult.isSuccess || !complaintResult.data) {
          Alert.alert("Error", "Failed to load complaint details");
          router.back();
          return;
        }

        const complaint = complaintResult.data;

        // Check if user owns this complaint
        if (complaint.residentId !== userInfo?.sub) {
          Alert.alert("Error", "You can only edit your own complaints");
          router.back();
          return;
        }

        // Store original complaint data
        setOriginalComplaint(complaint);

        // Debug: Log the complaint status
        console.log(
          "Complaint Status:",
          complaint.status,
          typeof complaint.status,
        );

        // Pre-fill form
        setValue("subject", complaint.subject);
        setValue("description", complaint.detail);

        // Load asset data
        const assetResult = await getAssetById(complaint.assetId);
        let assetTypeKey: AssetType | null = null;

        if (assetResult.isSuccess && assetResult.data) {
          const loadedAsset = assetResult.data as any; // Use any to bypass type checking issue
          setAsset(loadedAsset);

          // Get asset type for template matching
          assetTypeKey =
            typeof loadedAsset.assetType === "number"
              ? (loadedAsset.assetType as AssetType)
              : AssetType[loadedAsset.assetType as keyof typeof AssetType];
        }

        // Find matching template based on subject
        if (assetTypeKey !== null) {
          const templates = COMPLAINT_TEMPLATES[assetTypeKey];
          const matchingTemplate = templates?.find(
            (t) => t.subject === complaint.subject,
          );

          if (matchingTemplate) {
            setSelectedTemplateId(matchingTemplate.id);
          } else {
            // If no match found, assume it's "other"
            const otherTemplate = templates?.find((t) =>
              t.id.endsWith("_other"),
            );
            if (otherTemplate) {
              setSelectedTemplateId(otherTemplate.id);
            }
          }
        }

        // Load existing attachments
        const attachmentsResult = await getAttachmentsClient(
          EntityType.InfrastructureComplain,
          complainId,
        );
        if (attachmentsResult.isSuccess && attachmentsResult.data) {
          setExistingAttachments(attachmentsResult.data);
        }

        // Load existing complaints for this asset
        if (complaint.assetId) {
          const complaintsResult = await getComplaintsByAsset(
            complaint.assetId,
          );
          if (complaintsResult.isSuccess && complaintsResult.data) {
            setExistingComplaints(complaintsResult.data);
          }
        }
      } catch (error) {
        console.error("Error loading complaint:", error);
        Alert.alert("Error", "Failed to load complaint details");
        router.back();
      } finally {
        setLoading(false);
      }
    };

    if (complainId) {
      loadComplaint();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complainId]);

  const handleTemplateSelect = (templateId: string, subject: string) => {
    setSelectedTemplateId(templateId);
    setValue("subject", subject);

    // If it's "other" template (no subject), keep existing or clear
    if (!subject && templateId.includes("_other")) {
      // Keep the existing subject value for "other"
    }
  };

  async function onSubmit(data: ComplainForm) {
    if (!data.subject.trim()) {
      Alert.alert("Validation Error", "Subject is required");
      return;
    }

    // Validation: If "Other" is selected, both subject and description required
    const isOtherTemplate = selectedTemplateId?.includes("_other");
    if (isOtherTemplate && !data.description) {
      Alert.alert(
        "Validation Error",
        "Please provide a description for your complaint",
      );
      return;
    }

    if (!selectedTemplateId) {
      Alert.alert("Validation Error", "Please select a complaint type");
      return;
    }

    setUploading(true);
    try {
      // Update complaint - include assetId and infrastructureType to prevent them from being null
      const updateData = {
        subject: data.subject,
        detail: data.description || "",
        assetId: originalComplaint?.assetId,
        infrastructureType: originalComplaint?.infrastructureType,
        status: originalComplaint?.status,
      };

      const result = await updateInfrastructureComplaint(
        complainId,
        updateData,
      );

      if (!result.isSuccess) {
        console.error("Failed to update complaint:", result.message);
        Alert.alert("Error", "Failed to update complaint");
        setUploading(false);
        return;
      }

      console.log("Complaint updated successfully:", result.data);

      // Upload new attachments if any
      if (attachments.length > 0) {
        try {
          const uploadResult = await uploadAttachmentsClient(
            EntityType.InfrastructureComplain,
            complainId,
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
      Alert.alert("Success", "Complaint updated successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      setUploading(false);
      console.error("Error updating complaint:", error);
      Alert.alert("Error", "Failed to update complaint");
    }
  }

  async function handleDelete() {
    Alert.alert(
      "Delete Complaint",
      "Are you sure you want to delete this complaint? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setUploading(true);
            try {
              const result = await deleteInfrastructureComplaint(complainId);

              if (!result.isSuccess) {
                console.error("Failed to delete complaint:", result.message);
                Alert.alert("Error", "Failed to delete complaint");
                setUploading(false);
                return;
              }

              console.log("Complaint deleted successfully");
              setUploading(false);
              Alert.alert("Success", "Complaint deleted successfully", [
                { text: "OK", onPress: () => router.back() },
              ]);
            } catch (error) {
              setUploading(false);
              console.error("Error deleting complaint:", error);
              Alert.alert("Error", "Failed to delete complaint");
            }
          },
        },
      ],
    );
  }

  // Helper to convert assetType string to number
  const getAssetTypeNumber = (assetType: any): number => {
    return typeof assetType === "number"
      ? assetType
      : AssetType[assetType as keyof typeof AssetType];
  };

  if (loading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView className="flex-1 bg-[#c7f9cc] justify-center items-center">
          <ActivityIndicator size="large" color="#22C55E" />
          <Text className="mt-4 text-[#22577a]">Loading complaint...</Text>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  if (!asset) {
    return (
      <SafeAreaProvider>
        <SafeAreaView className="flex-1 bg-[#c7f9cc] justify-center items-center">
          <Text>Asset data not found</Text>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

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
              {/* Header */}
              <View className="bg-white rounded-xl p-4 mb-4">
                <Text className="text-2xl font-bold text-[#1F2937] mb-2">
                  Edit Complaint
                </Text>
                <Text className="text-sm text-[#6B7280]">
                  Update your complaint details below
                </Text>
              </View>

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
                  currentComplaintId={complainId}
                />
              </View>

              {/* Subject Input (for "Other" option) */}
              {selectedTemplateId?.includes("_other") && (
                <View className="bg-white rounded-xl p-4 mb-4">
                  <Text className="font-bold text-lg text-[#1F2937] mb-2">
                    Subject *
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

              {/* Existing Attachments */}
              {existingAttachments.length > 0 && (
                <View className="mb-4">
                  <ExistingAttachmentsGrid
                    attachments={existingAttachments}
                    canDelete={originalComplaint?.status === ComplainStatus.New}
                    onAttachmentDeleted={async () => {
                      // Reload attachments after deletion
                      const attachmentsResult = await getAttachmentsClient(
                        EntityType.InfrastructureComplain,
                        complainId,
                      );
                      if (
                        attachmentsResult.isSuccess &&
                        attachmentsResult.data
                      ) {
                        setExistingAttachments(attachmentsResult.data);
                      }
                    }}
                  />
                </View>
              )}

              {/* New Attachments */}
              <View className="mb-4">
                <Text className="font-bold text-lg text-[#22577a] mb-2">
                  Add New Attachments (Optional)
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
                disabled={uploading}
                style={{
                  backgroundColor: assetColor,
                  paddingVertical: 8,
                  borderRadius: 8,
                }}
                labelStyle={{ fontSize: 18, fontWeight: "600" }}
              >
                {uploading ? "Updating..." : "Update Complaint"}
              </Button>

              {/* Cancel Button */}
              <Button
                mode="outlined"
                onPress={() => router.back()}
                disabled={uploading}
                style={{
                  marginTop: 12,
                  borderColor: assetColor,
                  borderRadius: 8,
                }}
                labelStyle={{ color: assetColor, fontSize: 16 }}
              >
                Cancel
              </Button>

              {/* Delete Button - Only show if status is New (0) */}
              {originalComplaint?.status === ComplainStatus.New && (
                <Button
                  mode="contained"
                  onPress={handleDelete}
                  disabled={uploading}
                  style={{
                    marginTop: 12,
                    backgroundColor: "#EF4444",
                    paddingVertical: 8,
                    borderRadius: 8,
                  }}
                  labelStyle={{ fontSize: 16, fontWeight: "600" }}
                  icon="delete"
                >
                  Delete Complaint
                </Button>
              )}

              {/* Debug Info */}
              <View className="mt-4 p-2 bg-gray-100 rounded">
                <Text className="text-xs text-gray-600">
                  Debug: Status = {JSON.stringify(originalComplaint?.status)} (
                  {typeof originalComplaint?.status})
                </Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
