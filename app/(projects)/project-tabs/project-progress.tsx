import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { ActivityIndicator, Card, ProgressBar, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { GetProjectProgressByProjectIdAsync } from "../../../api/projectAction";
import { ProjectProgressApprovedStatus } from "../../../enums/enum";
import { appStore } from "../../../stores/appStore";
import { ProjectProgress } from "../../../types";

// Component for displaying status badge
const StatusBadge = ({
  status,
  backgroundColor,
}: {
  status: string;
  backgroundColor: string;
}) => (
  <View className="px-3 py-1 rounded-full" style={{ backgroundColor }}>
    <Text className="text-[#22577a] text-xs font-medium">{status}</Text>
  </View>
);

// Component for displaying progress information
const ProgressInfo = ({
  projectProgress,
  getApprovalStatusText,
  getApprovalStatusColor,
}: {
  projectProgress: ProjectProgress;
  getApprovalStatusText: (status: ProjectProgressApprovedStatus) => string;
  getApprovalStatusColor: (status: ProjectProgressApprovedStatus) => string;
}) => (
  <View className="mb-4">
    <View className="flex-row justify-between items-center mb-2">
      <Text className="text-[#22577a] font-semibold">
        {projectProgress.summary}
      </Text>
      <StatusBadge
        status={getApprovalStatusText(
          projectProgress.projectProgressApprovedStatus
        )}
        backgroundColor={getApprovalStatusColor(
          projectProgress.projectProgressApprovedStatus
        )}
      />
    </View>
    <ProgressBar
      progress={projectProgress.progressPercentage / 100}
      color="#57cc99"
      style={{ height: 6, borderRadius: 3 }}
    />
    <Text className="text-right text-[#22577a] text-sm mt-1">
      {Math.round(projectProgress.progressPercentage)}%
    </Text>
    {projectProgress.description && (
      <Text className="text-[#22577a] text-sm mt-2 italic">
        {projectProgress.description}
      </Text>
    )}
    {projectProgress.progressDate && (
      <Text className="text-[#22577a] text-xs mt-1 text-right">
        Updated: {new Date(projectProgress.progressDate).toLocaleDateString()}
      </Text>
    )}
  </View>
);

export default function ProjectProgressScreen() {
  const { projectType, projectId } = useLocalSearchParams();
  const { currentProjectId, currentProjectType } = appStore();
  const [projectProgress, setProjectProgress] = useState<ProjectProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use store values as fallback if params are not available
  const activeProjectId = projectId || currentProjectId;
  const activeProjectType = projectType || currentProjectType;

  const fetchProjectProgress = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
        setError(null);
        const response = await GetProjectProgressByProjectIdAsync(
          activeProjectId as string
        );

        if (response.isSuccess) {
          setProjectProgress(response.data || []);
        } else {
          setError(response.message || "Failed to fetch project progress");
          console.error("Fetching project progress failed:", response.message);
          if (response.errors && response.errors.length > 0) {
            response.errors.forEach((error) => console.error(error));
          }
        }
      } catch (error) {
        console.error("Error fetching project progress:", error);
        setError("Failed to load project progress");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [activeProjectId]
  );

  const onRefresh = useCallback(() => {
    if (activeProjectId) {
      fetchProjectProgress(true);
    }
  }, [activeProjectId, fetchProjectProgress]);

  useEffect(() => {
    if (activeProjectId) {
      fetchProjectProgress();
    }
  }, [activeProjectId, fetchProjectProgress]);

  // Helper functions for status colors and text
  const getApprovalStatusText = (
    status: ProjectProgressApprovedStatus
  ): string => {
    switch (status) {
      case ProjectProgressApprovedStatus.Pending:
        return "Pending";
      case ProjectProgressApprovedStatus.Approved:
        return "Approved";
      case ProjectProgressApprovedStatus.Rejected:
        return "Rejected";
      default:
        return "Unknown";
    }
  };

  const getApprovalStatusColor = (
    status: ProjectProgressApprovedStatus
  ): string => {
    switch (status) {
      case ProjectProgressApprovedStatus.Pending:
        return "#ffd166";
      case ProjectProgressApprovedStatus.Approved:
        return "#80ed99";
      case ProjectProgressApprovedStatus.Rejected:
        return "#ff6b6b";
      default:
        return "#c7f9cc";
    }
  };

  // Get the latest progress item and calculate overall progress
  const latestProgress = projectProgress.length > 0 ? projectProgress[0] : null;
  const overallProgress =
    projectProgress.length > 0
      ? Math.max(...projectProgress.map((p) => p.progressPercentage))
      : 0;

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#c7f9cc]">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator animating={true} color="#57cc99" size="large" />
          <Text className="text-[#22577a] mt-2">
            Loading project progress...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#c7f9cc]">
      <ScrollView
        className="flex-1 p-4"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#57cc99"]}
            tintColor="#57cc99"
          />
        }
      >
        {error && (
          <Card className="mb-4 bg-red-100">
            <Card.Content>
              <Text className="text-red-600">{error}</Text>
            </Card.Content>
          </Card>
        )}

        {projectProgress.length > 0 && (
          <Card className="mb-4">
            <Card.Title
              title={`${activeProjectType || "Project"} Progress Overview`}
              titleStyle={{ color: "#22577a", fontWeight: "bold" }}
            />
            <Card.Content>
              <Text className="text-[#22577a] mb-4">
                Track the current progress of your project.
              </Text>

              <View className="mb-4">
                <Text className="text-lg font-semibold text-[#22577a] mb-2">
                  Overall Progress: {Math.round(overallProgress)}%
                </Text>
                <ProgressBar
                  progress={overallProgress / 100}
                  color="#57cc99"
                  style={{ height: 8, borderRadius: 4 }}
                />
              </View>
            </Card.Content>
          </Card>
        )}

        <Card>
          <Card.Title
            title="Project Progress"
            titleStyle={{ color: "#22577a", fontWeight: "bold" }}
          />
          <Card.Content>
            {projectProgress.length > 0 ? (
              projectProgress.map((progress, index) => (
                <ProgressInfo
                  key={index}
                  projectProgress={progress}
                  getApprovalStatusText={getApprovalStatusText}
                  getApprovalStatusColor={getApprovalStatusColor}
                />
              ))
            ) : (
              <Text className="text-[#22577a] text-center">
                No progress data available for this project.
              </Text>
            )}
          </Card.Content>
        </Card>

        {latestProgress?.approvedByUser && (
          <Card className="mt-4">
            <Card.Title
              title="Approval Information"
              titleStyle={{ color: "#22577a", fontWeight: "bold" }}
            />
            <Card.Content>
              <View className="space-y-2">
                <View>
                  <Text className="text-[#22577a] font-semibold">
                    Approved By:
                  </Text>
                  <Text className="text-[#22577a]">
                    {latestProgress.approvedByUser.firstName}{" "}
                    {latestProgress.approvedByUser.lastName || ""}
                  </Text>
                </View>
                <View>
                  <Text className="text-[#22577a] font-semibold">Status:</Text>
                  <Text className="text-[#22577a]">
                    {getApprovalStatusText(
                      latestProgress.projectProgressApprovedStatus
                    )}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}

        {projectProgress.length === 0 && !loading && !error && (
          <Card className="mt-4">
            <Card.Title
              title="No Data Available"
              titleStyle={{ color: "#22577a", fontWeight: "bold" }}
            />
            <Card.Content>
              <Text className="text-[#22577a] text-center mb-4">
                No progress information is currently available for this project.
              </Text>
              <Text className="text-[#22577a] text-sm text-center opacity-70">
                Progress updates will appear here once they are added by the
                project team.
              </Text>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
