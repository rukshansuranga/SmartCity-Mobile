import { Picker } from "@react-native-picker/picker";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  View,
} from "react-native";

import { ProjectStatus, ProjectType } from "@/enums/enum"; // Adjust the import path as necessary
import { useEffect, useState } from "react";
import {
  Button,
  IconButton,
  MD3Colors,
  Text,
  TextInput,
} from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import ComplainAddModal from "./ComplainAddModal";
import ComplainListModel from "./ComplainListModal";

export default function SelectProjectForComplain() {
  const [selectedType, setSelectedType] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [text, setText] = useState("");
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("add");

  async function handleSearch() {
    try {
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/project/filter`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: selectedType,
            status: selectedStatus,
            name: text,
          }),
        }
      );

      const response = await res.json();

      // Handle new ApiResponse structure
      if (response && typeof response === "object" && "isSuccess" in response) {
        if (!response.isSuccess) {
          console.error("Search failed:", response.message);
          if (response.errors && response.errors.length > 0) {
            response.errors.forEach((error) => console.error(error));
          }
          setProjects([]);
          return;
        }
        // Use the data property for successful response
        setProjects(response.data || []);
      } else {
        // For backwards compatibility
        setProjects(response || []);
      }
    } catch (error) {
      console.error("Error searching projects:", error);
      setProjects([]);
    }
  }

  useEffect(() => {
    setSelectedProject(
      projects.find((project) => project.id === selectedProjectId)
    );
  }, [selectedProjectId]);

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View className="flex-1 items-center justify-center px-2">
            <View className=" bg-white p-4 rounded-lg shadow-md  w-full">
              <View className="flex gap-2 w-full">
                <View className="w-full">
                  <Picker
                    selectedValue={selectedType}
                    onValueChange={(itemValue, itemIndex) =>
                      setSelectedType(itemValue)
                    }
                    mode="dropdown"
                    style={{ fontSize: 18 }}
                    itemStyle={{ fontSize: 30 }}
                  >
                    <Picker.Item
                      key={0}
                      label="Select Project Type"
                      value={null}
                    />
                    {Object.keys(ProjectType)
                      .filter((key) => isNaN(Number(key)))
                      ?.map((key) => {
                        const value =
                          ProjectType[key as keyof typeof ProjectType];
                        return (
                          <Picker.Item key={value} label={key} value={value} />
                        );
                      })}
                  </Picker>
                </View>
                <View className="w-full">
                  <Picker
                    selectedValue={selectedStatus}
                    onValueChange={(itemValue, itemIndex) =>
                      setSelectedStatus(itemValue)
                    }
                    mode="dropdown"
                    style={{ fontSize: 18 }}
                    itemStyle={{ fontSize: 30 }}
                  >
                    <Picker.Item
                      key={0}
                      label="Select Project Status"
                      value={null}
                    />
                    {Object.keys(ProjectStatus)
                      .filter((key) => isNaN(Number(key)))
                      ?.map((key) => {
                        const value =
                          ProjectStatus[key as keyof typeof ProjectStatus];
                        return (
                          <Picker.Item key={value} label={key} value={value} />
                        );
                      })}
                  </Picker>
                </View>
                <View className="w-full">
                  <TextInput
                    label="Search by Name/Description"
                    placeholder="Project Name/Description"
                    value={text}
                    onChangeText={setText}
                  />
                </View>
                <View className="w-full">
                  <Button mode="contained" onPress={handleSearch}>
                    Search
                  </Button>
                </View>
              </View>
            </View>
            <View className="w-full mt-4">
              {projects.length > 0 ? (
                <View>
                  <Picker
                    selectedValue={selectedStatus}
                    onValueChange={(itemValue, itemIndex) =>
                      setSelectedProjectId(itemValue)
                    }
                    mode="dropdown"
                    style={{ fontSize: 18 }}
                    itemStyle={{ fontSize: 30 }}
                  >
                    <Picker.Item
                      key={0}
                      label="Select Project Status"
                      value={null}
                    />
                    {projects?.map((project) => (
                      <Picker.Item
                        key={project.id}
                        label={project.subject}
                        value={project.id}
                      />
                    ))}
                  </Picker>
                </View>
              ) : (
                <View className="flex-1 items-center justify-center">
                  <Text>No projects found</Text>
                </View>
              )}
              {selectedProject && (
                <View>
                  <View>
                    <TextInput
                      label="Description"
                      value={selectedProject?.description || ""}
                      multiline={true}
                      numberOfLines={4} // Initial height for 4 lines
                      mode="outlined" // Or "flat" based on your design preference
                    />
                  </View>
                  <View className="flex-row items-center justify-center w-full gap-2 px-5 mt-3">
                    <Button
                      onPress={() => {
                        setModalType("list");
                        setModalVisible(true);
                      }}
                      mode="contained"
                    >
                      Complains
                    </Button>
                    <Button
                      onPress={() => {
                        setModalType("add");
                        setModalVisible(true);
                      }}
                      mode="contained"
                    >
                      Add{" "}
                    </Button>
                  </View>
                </View>
              )}
            </View>
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
            <View className="flex-1 justify-center items-center bg-red-50 px-5 py-12">
              <View className="flex-1 w-full p-4 bg-slate-200 rounded-md items-center elevation-sm">
                <View className="flex-1 w-full justify-center items-center">
                  <View className="flex-1 w-full">
                    {modalType === "add" && (
                      <ComplainAddModal
                        project={selectedProject}
                        closeModel={setModalVisible}
                      />
                    )}
                    {modalType === "list" && (
                      <ComplainListModel project={selectedProject} />
                    )}
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
    </SafeAreaProvider>
  );
}
