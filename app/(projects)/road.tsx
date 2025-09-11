import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetTextInput,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Button, Card, Text } from "react-native-paper";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { filterProjects, getRecentProjects } from "../../api/projectAction";
import { ProjectType } from "../../enums/enum";

export default function Road() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [textSearch, setTextSearch] = useState("");
  const [citySearch, setCitySearch] = useState("");

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["50%", "75%"], []);

  useEffect(() => {
    getRecentProjectsHandler();
  }, []);

  async function getRecentProjectsHandler() {
    const response = await getRecentProjects(ProjectType.Road);
    if (!response.isSuccess) {
      console.error("API Error:", response.message);
      return;
    }

    setProjects(response.data);
  }

  const fetchProjects = async (type, status, subject, city, isRecent) => {
    console.log("Fetching projects with filters:", {
      type,
      status,
      subject,
      city,
      isRecent,
    });

    try {
      const response = await filterProjects({
        type: ProjectType.Road,
        status: status,
        subject: subject,
        city: city,
        isRecent: true,
      });

      if (!response.isSuccess) {
        console.error("API Error:", response.message);
        return;
      }

      setProjects(response.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  // Callbacks
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  const navigateToDetail = useCallback(
    (item) => {
      router.navigate({
        pathname: "/projectDetail",
        params: { projectId: item.id },
      });
    },
    [router]
  );

  const searchProjects = useCallback(() => {
    fetchProjects(null, null, textSearch, citySearch, false);
    bottomSheetModalRef.current?.dismiss();
  }, [textSearch, citySearch]);

  const renderProjectItem = useCallback(
    ({ item }) => (
      <View className="mx-3 mt-2">
        <Card className="bg-white shadow-lg">
          <View className="p-4 gap-3">
            {/* Project Name */}
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-bold text-[#22577a] flex-1">
                {item.name}
              </Text>
            </View>

            {/* Status and End Date */}
            <View className="flex-row justify-between items-center">
              <View className="bg-[#80ed99] rounded-lg py-2 px-3 shadow-sm">
                <Text className="font-semibold text-[#22577a]">
                  {item?.status}
                </Text>
              </View>
              <Text className="text-gray-600 font-medium">{item.endDate}</Text>
            </View>

            {/* City and View Button */}
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="text-gray-700 font-medium">
                  📍 {item.city}
                </Text>
              </View>
              <Button
                onPress={() => navigateToDetail(item)}
                mode="contained"
                buttonColor="#57cc99"
                textColor="#22577a"
                style={{ borderRadius: 8 }}
              >
                View Details
              </Button>
            </View>
          </View>
        </Card>
      </View>
    ),
    [navigateToDetail]
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <SafeAreaProvider>
          <SafeAreaView className="flex-1 bg-[#c7f9cc]">
            {/* Header with Search Button */}
            <View className="px-4 py-3">
              <Button
                onPress={handlePresentModalPress}
                mode="contained"
                buttonColor="#80ed99"
                textColor="#22577a"
                style={{ borderRadius: 12 }}
                contentStyle={{ paddingVertical: 8 }}
              >
                🔍 Search Projects
              </Button>
            </View>

            {/* Projects List */}
            <View className="flex-1 pb-5">
              <FlatList
                data={projects}
                renderItem={renderProjectItem}
                keyExtractor={(item, index) =>
                  item.id?.toString() || String(index)
                }
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
              />
            </View>
          </SafeAreaView>
        </SafeAreaProvider>

        {/* Search Modal */}
        <BottomSheetModal
          ref={bottomSheetModalRef}
          onChange={handleSheetChanges}
          snapPoints={snapPoints}
          backgroundStyle={{ backgroundColor: "#f0fdf4" }}
        >
          <BottomSheetView className="flex-1">
            <View className="px-6 py-4">
              {/* Modal Header */}
              <Text className="text-2xl font-bold text-[#22577a] text-center mb-6">
                Search Projects
              </Text>

              {/* Search by Name */}
              <View className="mb-4">
                <Text className="text-lg font-semibold text-[#22577a] mb-2">
                  Project Name
                </Text>
                <BottomSheetTextInput
                  onChangeText={setTextSearch}
                  value={textSearch}
                  placeholder="Enter project name..."
                  className="bg-white rounded-lg text-lg p-3 border border-gray-200"
                />
              </View>

              {/* Search by City */}
              <View className="mb-6">
                <Text className="text-lg font-semibold text-[#22577a] mb-2">
                  City
                </Text>
                <BottomSheetTextInput
                  onChangeText={setCitySearch}
                  value={citySearch}
                  placeholder="Enter city name..."
                  className="bg-white rounded-lg text-lg p-3 border border-gray-200"
                />
              </View>

              {/* Search Button */}
              <View className="items-center">
                <Button
                  onPress={searchProjects}
                  mode="contained"
                  buttonColor="#57cc99"
                  textColor="white"
                  style={{ borderRadius: 12, minWidth: 150 }}
                  contentStyle={{ paddingVertical: 8 }}
                >
                  Search
                </Button>
              </View>
            </View>
          </BottomSheetView>
        </BottomSheetModal>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
