import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import {
  ActivityIndicator,
  Card,
  Chip,
  IconButton,
  Text,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { getRecentProjects } from "../../api/projectAction";
import { ProjectStatus, ProjectType } from "../../enums/enum";
import { appStore } from "../../stores/appStore";
import { Project } from "../../types";

export default function ProjectList() {
  const { projectType } = useLocalSearchParams();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProjectsExpanded, setIsProjectsExpanded] = useState(true);
  const [isStatsExpanded, setIsStatsExpanded] = useState(true);
  const { setCurrentProject } = appStore();

  useEffect(() => {
    fetchRecentProjects();
  }, [projectType]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchRecentProjects = async () => {
    try {
      setLoading(true);
      const projectTypeEnum = getProjectTypeEnum(projectType as string);
      const response = await getRecentProjects(projectTypeEnum);
      if (response.isSuccess) {
        setProjects(response.data);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const getProjectTypeEnum = (type: string): ProjectType => {
    switch (type) {
      case "Road":
        return ProjectType.Road;
      case "Irrigation":
        return ProjectType.Irrigation;
      case "Construction":
      case "Building":
        return ProjectType.Building;
      default:
        return ProjectType.Road;
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

  const handleProjectPress = (project: Project) => {
    // Set current project in store for tabs to access
    setCurrentProject(project.id.toString(), projectType as string);

    // Navigate to project detail tabs with the project ID
    router.push({
      pathname: "/project-tabs/project-details",
      params: {
        projectId: project.id.toString(),
        projectType: projectType as string,
      },
    });
  };

  const renderProjectItem = ({ item }: { item: Project }) => (
    <TouchableOpacity onPress={() => handleProjectPress(item)}>
      <Card className="mb-3">
        <Card.Content>
          <View className="flex-row justify-between items-start mb-2">
            <Text className="font-bold text-[#22577a] flex-1 mr-2">
              {item.subject}
            </Text>
            <Chip
              mode="outlined"
              textStyle={{ color: "#22577a", fontSize: 12 }}
              style={{ backgroundColor: getStatusColor(item.status) }}
            >
              {getStatusText(item.status)}
            </Chip>
          </View>

          <Text className="text-[#22577a] mb-2">{item.description}</Text>

          <View className="mb-2">
            <Text className="text-sm text-[#22577a]">
              <Text className="font-semibold">City: </Text>
              {item.city}
            </Text>
            <Text className="text-sm text-[#22577a]">
              <Text className="font-semibold">Start Date: </Text>
              {new Date(item.startDate).toLocaleDateString()}
            </Text>
            <Text className="text-sm text-[#22577a]">
              <Text className="font-semibold">End Date: </Text>
              {new Date(item.endDate).toLocaleDateString()}
            </Text>
            <Text className="text-sm text-[#22577a]">
              <Text className="font-semibold">Estimated Cost: </Text>$
              {item.estimatedCost.toLocaleString()}
            </Text>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#c7f9cc]">
      <ScrollView className="flex-1 p-4">
        {/* Header */}
        <View className="mb-4">
          <Text className="text-2xl font-bold text-[#22577a] text-center">
            {projectType} Projects
          </Text>
        </View>

        {/* Recent Projects Section */}
        <Card className="mb-4">
          <Card.Title
            title={`Recent ${projectType} Projects`}
            titleStyle={{ color: "#22577a", fontWeight: "bold" }}
            right={(props) => (
              <IconButton
                {...props}
                icon={isProjectsExpanded ? "chevron-up" : "chevron-down"}
                onPress={() => setIsProjectsExpanded(!isProjectsExpanded)}
                iconColor="#22577a"
              />
            )}
          />
          {isProjectsExpanded && (
            <Card.Content>
              {loading ? (
                <View className="justify-center items-center py-8">
                  <ActivityIndicator
                    animating={true}
                    color="#57cc99"
                    size="large"
                  />
                  <Text className="text-[#22577a] mt-2">
                    Loading projects...
                  </Text>
                </View>
              ) : projects.length > 0 ? (
                <View style={{ maxHeight: 400 }}>
                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled={true}
                  >
                    {projects.map((item) => (
                      <View key={item.id.toString()}>
                        {renderProjectItem({ item })}
                      </View>
                    ))}
                  </ScrollView>
                </View>
              ) : (
                <View className="justify-center items-center py-8">
                  <Text className="text-[#22577a] text-center">
                    No recent {projectType?.toString().toLowerCase()} projects
                    found.
                  </Text>
                </View>
              )}
            </Card.Content>
          )}
        </Card>

        {/* Project Summary/Statistics Section */}
        <Card>
          <Card.Title
            title="Project Summary"
            titleStyle={{ color: "#22577a", fontWeight: "bold" }}
            right={(props) => (
              <IconButton
                {...props}
                icon={isStatsExpanded ? "chevron-up" : "chevron-down"}
                onPress={() => setIsStatsExpanded(!isStatsExpanded)}
                iconColor="#22577a"
              />
            )}
          />
          {isStatsExpanded && (
            <Card.Content>
              <View className="flex-row justify-between mb-2">
                <Text className="text-[#22577a]">Total Projects:</Text>
                <Text className="font-bold text-[#22577a]">
                  {projects.length}
                </Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-[#22577a]">Active Projects:</Text>
                <Text className="font-bold text-[#22577a]">
                  {
                    projects.filter(
                      (p) => p.status === ProjectStatus.InProgress
                    ).length
                  }
                </Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-[#22577a]">Completed Projects:</Text>
                <Text className="font-bold text-[#22577a]">
                  {
                    projects.filter((p) => p.status === ProjectStatus.Completed)
                      .length
                  }
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-[#22577a]">New Projects:</Text>
                <Text className="font-bold text-[#22577a]">
                  {
                    projects.filter((p) => p.status === ProjectStatus.New)
                      .length
                  }
                </Text>
              </View>
            </Card.Content>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
