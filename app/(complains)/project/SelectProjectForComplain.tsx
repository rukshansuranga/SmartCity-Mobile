import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  View,
} from "react-native";

import { filterProjects, getProjectsByCouncilId } from "@/api/projectAction";
import SelectProjectListView from "@/components/complains/SelectProjectListView";
import SelectProjectMapView from "@/components/complains/SelectProjectMapView";
import { useAuthStore } from "@/stores/authStore";
import { ProjectWithComplainInfo } from "@/types";
import { useEffect, useState } from "react";
import { Button, IconButton, MD3Colors } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import ComplainListModel from "./ComplainListModal";

export default function SelectProjectForComplain() {
  const { selectedCouncil } = useAuthStore();

  const [selectedType, setSelectedType] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [text, setText] = useState("");

  // Separate states for map and list
  const [mapProjects, setMapProjects] = useState([]);
  const [listProjects, setListProjects] = useState([]);

  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  const [modalVisible, setModalVisible] = useState(false);

  // View mode: 'list' or 'map'
  const [viewMode, setViewMode] = useState<"list" | "map">("map");

  // Load all council projects on mount for map view
  useEffect(() => {
    async function loadCouncilProjects() {
      if (!selectedCouncil?.value) {
        console.error("No council selected");
        return;
      }

      try {
        const response = await getProjectsByCouncilId(selectedCouncil.value);

        if (!response.isSuccess) {
          console.error("Failed to load council projects:", response.message);
          setMapProjects([]);
          return;
        }

        setMapProjects(response.data || []);
        console.log(
          `Loaded ${response.data?.length || 0} projects for council ${selectedCouncil.value}`,
        );
      } catch (error) {
        console.error("Error loading council projects:", error);
        setMapProjects([]);
      }
    }

    loadCouncilProjects();
  }, [selectedCouncil?.value]);

  async function handleSearch() {
    console.log("Searching with:", {
      type: selectedType,
      status: selectedStatus,
      name: text,
    });

    try {
      const response = await filterProjects({
        type: selectedType,
        status: selectedStatus,
        name: text,
        city: null,
        isRecent: false,
      });

      // Handle ApiResponse structure
      if (!response.isSuccess) {
        console.error("Search failed:", response.message);
        if (response.errors && response.errors.length > 0) {
          response.errors.forEach((error) => console.error(error));
        }
        setListProjects([]);
        return;
      }
      // Use the data property for successful response
      const projects = response.data || [];
      setListProjects(projects);

      // Auto-select and open modal if only one project found
      if (projects.length === 1) {
        setSelectedProjectId(projects[0].projectId);
        setSelectedProject(projects[0]);
        setModalVisible(true);
      }
    } catch (error) {
      console.error("Error searching projects:", error);
      setListProjects([]);
    }
  }

  useEffect(() => {
    // Find selected project in the appropriate state based on current view
    const projectsList = viewMode === "map" ? mapProjects : listProjects;
    setSelectedProject(
      projectsList.find((project) => project.projectId === selectedProjectId) ||
        null,
    );
  }, [selectedProjectId, mapProjects, listProjects, viewMode]);

  const handleProjectSelectFromMap = (project: ProjectWithComplainInfo) => {
    setSelectedProject(project);
    setSelectedProjectId(project.projectId);
    // Automatically open complain list modal
    setModalVisible(true);
  };

  return (
    <SafeAreaView className="flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View className="flex-1 px-2">
          {/* Toggle between List and Map view */}
          <View className="flex-row gap-2 py-2">
            <Button
              mode={viewMode === "map" ? "contained" : "outlined"}
              onPress={() => setViewMode("map")}
              icon="map"
              style={{ flex: 1 }}
              buttonColor={viewMode === "map" ? "#03A791" : undefined}
            >
              Map View
            </Button>
            <Button
              mode={viewMode === "list" ? "contained" : "outlined"}
              onPress={() => setViewMode("list")}
              icon="format-list-bulleted"
              style={{ flex: 1 }}
              buttonColor={viewMode === "list" ? "#03A791" : undefined}
            >
              List View
            </Button>
          </View>

          {viewMode === "list" ? (
            <SelectProjectListView
              selectedType={selectedType}
              setSelectedType={setSelectedType}
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
              text={text}
              setText={setText}
              projects={listProjects}
              selectedProjectId={selectedProjectId}
              setSelectedProjectId={setSelectedProjectId}
              selectedProject={selectedProject}
              handleSearch={handleSearch}
              onViewComplains={() => {
                setModalVisible(true);
              }}
            />
          ) : (
            <SelectProjectMapView
              projects={mapProjects}
              selectedProject={selectedProject}
              onProjectSelect={handleProjectSelectFromMap}
              onSwitchToList={() => setViewMode("list")}
            />
          )}
        </View>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            Alert.alert("Modal has been closed.");
            setModalVisible(!modalVisible);
          }}
        >
          <View
            className="flex-1 justify-center items-center px-5 py-12"
            style={{ backgroundColor: "#F1BA88" }}
          >
            <View
              className="flex-1 w-full p-4 rounded-md items-center elevation-sm"
              style={{ backgroundColor: "#E9F5BE" }}
            >
              <View className="flex-1 w-full justify-center items-center">
                <View className="flex-1 w-full">
                  <ComplainListModel project={selectedProject} />
                </View>
                <View className="h-15 mt-2">
                  <IconButton
                    icon="close"
                    iconColor={MD3Colors.primary10}
                    size={30}
                    mode="contained"
                    onPress={() => setModalVisible(!modalVisible)}
                  />
                </View>
              </View>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
