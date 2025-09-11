import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { ActivityIndicator, Card, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { getProjectDetails } from "../../../api/projectAction";
import { ProjectStatus } from "../../../enums/enum";
import { appStore } from "../../../stores/appStore";
import { Project } from "../../../types";

export default function ProjectDetails() {
  const { projectId, projectType } = useLocalSearchParams();
  const { currentProjectId, currentProjectType } = appStore();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  // Use store values as fallback if params are not available
  const activeProjectId = projectId || currentProjectId;
  const activeProjectType = projectType || currentProjectType;

  useEffect(() => {
    if (activeProjectId) {
      fetchProjectDetail();
    }
  }, [activeProjectId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProjectDetail = async () => {
    try {
      setLoading(true);
      const response = await getProjectDetails(activeProjectId as string);
      if (response.isSuccess) {
        setProject(response.data);
      } else {
        console.error("Fetching project detail failed:", response.message);
        if (response.errors && response.errors.length > 0) {
          response.errors.forEach((error) => console.error(error));
        }
      }
    } catch (error) {
      console.error("Error fetching project detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status: ProjectStatus): string => {
    switch (status) {
      case ProjectStatus.New:
        return "New";
      case ProjectStatus.InProgress:
        return "In Progress";
      case ProjectStatus.Completed:
        return "Completed";
      case ProjectStatus.OnHold:
        return "On Hold";
      default:
        return "Unknown";
    }
  };

  const getStatusColor = (status: ProjectStatus): string => {
    switch (status) {
      case ProjectStatus.New:
        return "#c7f9cc";
      case ProjectStatus.InProgress:
        return "#57cc99";
      case ProjectStatus.Completed:
        return "#80ed99";
      case ProjectStatus.OnHold:
        return "#ffd166";
      default:
        return "#c7f9cc";
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#c7f9cc]">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator animating={true} color="#57cc99" size="large" />
          <Text className="text-[#22577a] mt-2">
            Loading project details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!project) {
    return (
      <SafeAreaView className="flex-1 bg-[#c7f9cc]">
        <View className="flex-1 justify-center items-center">
          <Text className="text-[#22577a] text-center">
            Project details not found.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#c7f9cc]">
      <ScrollView className="flex-1 p-4">
        {/* Project Header */}
        <Card className="mb-4">
          <Card.Content>
            <View className="flex-row justify-between items-start mb-2">
              <Text className="font-bold text-2xl text-[#22577a] flex-1 mr-2">
                {project.subject}
              </Text>
              <View
                style={{
                  backgroundColor: getStatusColor(project.status),
                  borderRadius: 20,
                  paddingVertical: 4,
                  paddingHorizontal: 12,
                  borderWidth: 1,
                  borderColor: "#22577a",
                }}
              >
                <Text
                  style={{ color: "#22577a", fontSize: 14, fontWeight: "500" }}
                >
                  {getStatusText(project.status)}
                </Text>
              </View>
            </View>
            <Text className="text-[#22577a] text-lg mb-2">
              {project.description}
            </Text>
          </Card.Content>
        </Card>

        {/* Project Basic Information */}
        <Card className="mb-4">
          <Card.Title
            title="Basic Information"
            titleStyle={{ color: "#22577a", fontWeight: "bold" }}
          />
          <Card.Content>
            <View className="mb-3">
              <Text className="text-sm text-[#22577a] font-semibold">
                Project Name:
              </Text>
              <Text className="text-[#22577a] text-lg">{project.subject}</Text>
            </View>
            <View className="mb-3">
              <Text className="text-sm text-[#22577a] font-semibold">
                City:
              </Text>
              <Text className="text-[#22577a] text-lg">{project.city}</Text>
            </View>
            <View className="mb-3">
              <Text className="text-sm text-[#22577a] font-semibold">
                Project Type:
              </Text>
              <Text className="text-[#22577a] text-lg">
                {activeProjectType}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Project Timeline */}
        <Card className="mb-4">
          <Card.Title
            title="Timeline"
            titleStyle={{ color: "#22577a", fontWeight: "bold" }}
          />
          <Card.Content>
            <View className="mb-3">
              <Text className="text-sm text-[#22577a] font-semibold">
                Start Date:
              </Text>
              <Text className="text-[#22577a] text-lg">
                {new Date(project.startDate).toLocaleDateString()}
              </Text>
            </View>
            <View className="mb-3">
              <Text className="text-sm text-[#22577a] font-semibold">
                End Date:
              </Text>
              <Text className="text-[#22577a] text-lg">
                {new Date(project.endDate).toLocaleDateString()}
              </Text>
            </View>
            <View className="mb-3">
              <Text className="text-sm text-[#22577a] font-semibold">
                Duration:
              </Text>
              <Text className="text-[#22577a] text-lg">
                {Math.ceil(
                  (new Date(project.endDate).getTime() -
                    new Date(project.startDate).getTime()) /
                    (1000 * 60 * 60 * 24)
                )}{" "}
                days
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Budget Information */}
        <Card className="mb-4">
          <Card.Title
            title="Budget"
            titleStyle={{ color: "#22577a", fontWeight: "bold" }}
          />
          <Card.Content>
            <View className="mb-3">
              <Text className="text-sm text-[#22577a] font-semibold">
                Estimated Cost:
              </Text>
              <Text className="text-[#22577a] text-lg font-bold">
                Rs{project.estimatedCost.toLocaleString()}
              </Text>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
