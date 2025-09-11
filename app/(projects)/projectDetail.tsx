import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { Card, Text } from "react-native-paper";
import { getProjectDetails } from "../../api/projectAction";

export default function ProjectDetail() {
  const { projectId } = useLocalSearchParams();

  const [project, setProject] = useState(null);

  useEffect(() => {
    if (projectId) {
      fetchProjectDetail(projectId);
    }
  }, [projectId]);

  async function fetchProjectDetail(id) {
    try {
      const response = await getProjectDetails(id);

      // Handle new ApiResponse structure

      if (!response.isSuccess) {
        console.error("Fetching project detail failed:", response.message);
        if (response.errors && response.errors.length > 0) {
          response.errors.forEach((error) => console.error(error));
        }
        setProject(null);
        return;
      }
      // Use the data property for successful response
      setProject(response.data);
    } catch (error) {
      console.error("Error fetching project detail:", error);
      setProject(null);
    }
  }

  console.log("Project Detail:", project);

  return (
    <View className="flex-1 justify-center items-center w-full gap-2">
      <Card className="w-11/12 ">
        <Card.Content className="bg-blue-100">
          <View className="p-2">
            <Text className="font-bold">Project Title</Text>
            <Text className="font-bold text-xl">{project?.name}</Text>
          </View>
          <View className="p-2">
            <Text className="font-bold">Description</Text>
            <Text className="font-bold text-md">{project?.description}</Text>
          </View>
          <View className="flex-row justify-between p-2">
            <View className="p-2">
              <Text>Start Date</Text>
              <Text className="font-bold text-md">{project?.startDate}</Text>
            </View>
            <View className="p-2">
              <Text>End Date</Text>
              <Text className="font-bold text-md">{project?.endDate}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card className="w-11/12">
        <Card.Content className="bg-blue-200">
          <View className="flex-row justify-between p-2">
            <View className="p-2">
              <Text>Location</Text>
              <Text className="font-bold text-md">{project?.location}</Text>
            </View>
            <View className="p-2">
              <Text>City</Text>
              <Text className="font-bold text-md">{project?.city}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
      {project?.awadedTener ? (
        <Card className="w-11/12">
          <Card.Content className="bg-blue-300">
            <View className="flex-row justify-between p-2">
              <View className="p-2">
                <Text>Company</Text>
                <Text className="font-bold text-md">
                  {project?.awadedTener?.company?.name}
                </Text>
              </View>
              <View className="p-2">
                <Text>Amount</Text>
                <Text className="font-bold text-md">
                  {project?.awadedTener?.bidAmount}
                </Text>
              </View>
            </View>
            <View className="flex-row justify-between p-2">
              <View className="p-2">
                <Text>Submited Date</Text>
                <Text className="font-bold text-md">
                  {new Date(project?.awadedTener?.submittedDate)
                    .toISOString()
                    .slice(0, 10)}
                </Text>
              </View>
              <View className="p-2">
                <Text>Ended Date</Text>
                <Text className="font-bold text-md">
                  {project?.tenderClosingDate}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      ) : (
        <View className="flex w-11/12">
          <Card className="w-full">
            <Card.Content className="justify-center items-center p-4 bg-red-100">
              <View>
                <Text>No Awarded Tender Id</Text>
              </View>
            </Card.Content>
          </Card>
        </View>
      )}
    </View>
  );
}
