import {
  deleteInfrastructureComplaint,
  getAssetById,
  getComplaintsByAsset,
} from "@/api/infrastructureAction";
import CommentManager from "@/components/CommentManager";
import AssetDetailCard from "@/components/infrastructure/AssetDetailCard";
import { ASSET_COLORS } from "@/config/assetConfig";
import { ComplainStatus, EntityType } from "@/enums/enum";
import { useAuthStore } from "@/stores/authStore";
import {
  AssetType,
  InfrastructureAsset,
  InfrastructureComplaint,
} from "@/types/infrastructure";
import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function AssetDetail() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const assetId = params.assetId as string;
  const { userInfo } = useAuthStore();

  const [asset, setAsset] = useState<InfrastructureAsset | null>(null);
  const [complaints, setComplaints] = useState<InfrastructureComplaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingComplaints, setLoadingComplaints] = useState(true);

  const loadAsset = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getAssetById(assetId);
      if (result.isSuccess && result.data) {
        setAsset(result.data);
      } else {
        console.error("Failed to load asset:", result.message);
      }
    } catch (error) {
      console.error("Error loading asset:", error);
    } finally {
      setLoading(false);
    }
  }, [assetId]);

  const loadComplaints = useCallback(async () => {
    try {
      setLoadingComplaints(true);
      const result = await getComplaintsByAsset(assetId);
      if (result.isSuccess && result.data) {
        // Show only the 5 most recent
        setComplaints(result.data.slice(0, 5));
      }
    } catch (error) {
      console.error("Error loading complaints:", error);
    } finally {
      setLoadingComplaints(false);
    }
  }, [assetId]);

  useEffect(() => {
    loadAsset();
    loadComplaints();
  }, [loadAsset, loadComplaints]);

  // Reload complaints when screen comes into focus (e.g., after creating a new complaint)
  useFocusEffect(
    useCallback(() => {
      loadComplaints();
    }, [loadComplaints]),
  );

  const handleReportIssue = () => {
    router.push({
      pathname: "/(complains)/infrastructure/create/[assetId]",
      params: { assetId },
    });
  };

  const handleEditComplaint = (complainId: number) => {
    router.push({
      pathname: "/(complains)/infrastructure/edit/[complainId]" as any,
      params: { complainId: complainId.toString() },
    });
  };

  const handleDeleteComplaint = (complainId: number, subject: string) => {
    Alert.alert(
      "Delete Complaint",
      `Are you sure you want to delete "${subject}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const result = await deleteInfrastructureComplaint(complainId);
              if (result.isSuccess) {
                Alert.alert("Success", "Complaint deleted successfully");
                loadComplaints(); // Reload the list
              } else {
                Alert.alert(
                  "Error",
                  result.message || "Failed to delete complaint",
                );
              }
            } catch (error) {
              console.error("Error deleting complaint:", error);
              Alert.alert("Error", "Failed to delete complaint");
            }
          },
        },
      ],
    );
  };

  const getStatusColor = (status: number) => {
    const colors = ["#3B82F6", "#EAB308", "#22C55E", "#6B7280"];
    return colors[status] || "#6B7280";
  };

  const getStatusLabel = (status: number) => {
    const labels = ["New", "In Progress", "Resolved", "Closed"];
    return labels[status] || "Unknown";
  };

  if (loading || !asset) {
    return (
      <SafeAreaProvider>
        <SafeAreaView className="flex-1 bg-[#c7f9cc] justify-center items-center">
          <ActivityIndicator size="large" color="#22C55E" />
          <Text className="mt-4 text-[#22577a]">Loading asset details...</Text>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  // Convert assetType to number if it's a string
  const getAssetTypeNumber = (assetType: any): number => {
    return typeof assetType === "number"
      ? assetType
      : AssetType[assetType as keyof typeof AssetType];
  };

  const assetTypeKey = getAssetTypeNumber(asset.assetType);
  const headerColor = ASSET_COLORS[assetTypeKey];

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-[#c7f9cc]">
        {/* Header */}
        <View style={[styles.header, { backgroundColor: headerColor }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Asset Details</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView className="flex-1">
          <View className="p-4">
            {/* Asset Details Card */}
            <AssetDetailCard asset={asset} />

            {/* Complaint History Section */}
            <View className="bg-white rounded-xl p-4 mb-4">
              <Text className="text-xl font-bold text-[#1F2937] mb-3">
                Recent Complaints
              </Text>

              {loadingComplaints ? (
                <ActivityIndicator size="small" color="#22C55E" />
              ) : !complaints || complaints.length === 0 ? (
                <Text className="text-[#6B7280] text-center py-4">
                  No complaints reported yet
                </Text>
              ) : (
                <>
                  {complaints.map((complaint) => {
                    // Debug logging
                    console.log("Complaint Debug:", {
                      complainId: complaint.complainId,
                      subject: complaint.subject,
                      status: complaint.status,
                      statusType: typeof complaint.status,
                      ComplainStatusNew: ComplainStatus.New,
                      isStatusNew: complaint.status === ComplainStatus.New,
                      residentId: complaint.residentId,
                      userSub: userInfo?.sub,
                      isOwner: complaint.residentId === userInfo?.sub,
                      shouldShowDelete:
                        complaint.residentId === userInfo?.sub &&
                        complaint.status === ComplainStatus.New,
                    });

                    return (
                      <View
                        key={complaint.complainId}
                        className="border-b border-[#E5E7EB] py-3"
                      >
                        <View className="flex-row justify-between items-start">
                          {/* Left side - Subject and details */}
                          <View className="flex-1 pr-3">
                            {/* Subject with New tag */}
                            <View className="flex-row items-center mb-1">
                              {complaint.status === ComplainStatus.New && (
                                <View
                                  style={[
                                    styles.newBadge,
                                    {
                                      backgroundColor: getStatusColor(
                                        complaint.status,
                                      ),
                                    },
                                  ]}
                                >
                                  <Text style={styles.newBadgeText}>NEW</Text>
                                </View>
                              )}
                              <Text
                                className="flex-1 font-semibold text-[#1F2937]"
                                numberOfLines={2}
                              >
                                {complaint.subject}
                              </Text>
                            </View>

                            {/* Status badge - only show for non-New statuses */}
                            {complaint.status !== ComplainStatus.New && (
                              <View
                                style={[
                                  styles.statusBadge,
                                  {
                                    backgroundColor: getStatusColor(
                                      complaint.status,
                                    ),
                                    alignSelf: "flex-start",
                                    marginBottom: 8,
                                  },
                                ]}
                              >
                                <Text style={styles.statusBadgeText}>
                                  {getStatusLabel(complaint.status)}
                                </Text>
                              </View>
                            )}

                            {/* Description */}
                            {complaint.detail && (
                              <Text
                                className="text-sm text-[#6B7280] mb-2"
                                numberOfLines={2}
                              >
                                {complaint.detail}
                              </Text>
                            )}

                            {/* Date */}
                            <Text className="text-xs text-[#9CA3AF]">
                              {new Date(
                                complaint.createdAt,
                              ).toLocaleDateString()}
                            </Text>
                          </View>

                          {/* Right side - Action buttons (2 rows) */}
                          <View
                            className="flex-col items-end"
                            style={{ gap: 2 }}
                          >
                            {/* First row: Edit + Delete buttons */}
                            {(complaint.residentId === userInfo?.sub ||
                              (complaint.residentId === userInfo?.sub &&
                                complaint.status === ComplainStatus.New)) && (
                              <View className="flex-row" style={{ gap: 4 }}>
                                {/* Edit button - only show for user's own complaints */}
                                {complaint.residentId === userInfo?.sub && (
                                  <TouchableOpacity
                                    onPress={() =>
                                      handleEditComplaint(complaint.complainId)
                                    }
                                    style={styles.actionButton}
                                  >
                                    <MaterialIcons
                                      name="edit"
                                      size={20}
                                      color="#3B82F6"
                                    />
                                  </TouchableOpacity>
                                )}

                                {/* Delete button - only show for user's own complaints with New status */}
                                {complaint.residentId === userInfo?.sub &&
                                  complaint.status === ComplainStatus.New && (
                                    <TouchableOpacity
                                      onPress={() =>
                                        handleDeleteComplaint(
                                          complaint.complainId,
                                          complaint.subject,
                                        )
                                      }
                                      style={styles.actionButton}
                                    >
                                      <MaterialIcons
                                        name="delete"
                                        size={20}
                                        color="#EF4444"
                                      />
                                    </TouchableOpacity>
                                  )}
                              </View>
                            )}

                            {/* Second row: Comment button */}
                            <CommentManager
                              entityId={complaint.complainId.toString()}
                              entityType={EntityType.InfrastructureComplain}
                              isPrivate={false}
                            />
                          </View>
                        </View>
                      </View>
                    );
                  })}

                  {complaints.length === 5 && (
                    <TouchableOpacity className="py-3">
                      <Text className="text-center text-[#3B82F6] font-semibold">
                        View All Complaints
                      </Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>

            {/* Report Issue Button */}
            <Button
              mode="contained"
              onPress={handleReportIssue}
              style={{
                backgroundColor: headerColor,
                paddingVertical: 8,
                borderRadius: 8,
              }}
              labelStyle={{ fontSize: 18, fontWeight: "600" }}
              icon="alert-circle"
            >
              Report Issue
            </Button>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  headerSpacer: {
    width: 32,
  },
  newBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 6,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#fff",
  },
  actionButton: {
    padding: 4,
    backgroundColor: "#F3F4F6",
    borderRadius: 6,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
});
