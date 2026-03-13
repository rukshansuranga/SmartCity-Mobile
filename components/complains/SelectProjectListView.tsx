import { ProjectStatus, ProjectType } from "@/enums/enum";
import { ProjectWithComplainInfo } from "@/types";
import { Picker } from "@react-native-picker/picker";
import { View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";

interface SelectProjectListViewProps {
  selectedType: number | null;
  setSelectedType: (value: number | null) => void;
  selectedStatus: number | null;
  setSelectedStatus: (value: number | null) => void;
  text: string;
  setText: (value: string) => void;
  projects: ProjectWithComplainInfo[];
  selectedProjectId: number | null;
  setSelectedProjectId: (value: number | null) => void;
  selectedProject: ProjectWithComplainInfo | null;
  handleSearch: () => void;
  onViewComplains: () => void;
}

export default function SelectProjectListView({
  selectedType,
  setSelectedType,
  selectedStatus,
  setSelectedStatus,
  text,
  setText,
  projects,
  selectedProjectId,
  setSelectedProjectId,
  selectedProject,
  handleSearch,
  onViewComplains,
}: SelectProjectListViewProps) {
  return (
    <View className="flex-1">
      {/* Search Filters */}
      <View
        className="p-4 rounded-lg shadow-md w-full"
        style={{ backgroundColor: "#E9F5BE" }}
      >
        <View className="flex gap-2 w-full">
          {/* Project Type Picker */}
          <View className="w-full">
            <Picker
              selectedValue={selectedType}
              onValueChange={(itemValue) => setSelectedType(itemValue)}
              mode="dropdown"
              style={{ fontSize: 18 }}
              itemStyle={{ fontSize: 30 }}
            >
              <Picker.Item key={0} label="Select Project Type" value={null} />
              {Object.keys(ProjectType)
                .filter((key) => isNaN(Number(key)))
                ?.map((key) => {
                  const value = ProjectType[key as keyof typeof ProjectType];
                  return <Picker.Item key={value} label={key} value={value} />;
                })}
            </Picker>
          </View>

          {/* Project Status Picker */}
          <View className="w-full">
            <Picker
              selectedValue={selectedStatus}
              onValueChange={(itemValue) => setSelectedStatus(itemValue)}
              mode="dropdown"
              style={{ fontSize: 18 }}
              itemStyle={{ fontSize: 30 }}
            >
              <Picker.Item key={0} label="Select Project Status" value={null} />
              {Object.keys(ProjectStatus)
                .filter((key) => isNaN(Number(key)))
                ?.map((key) => {
                  const value =
                    ProjectStatus[key as keyof typeof ProjectStatus];
                  return <Picker.Item key={value} label={key} value={value} />;
                })}
            </Picker>
          </View>

          {/* Search Input */}
          <View className="w-full">
            <TextInput
              label="Search by Name/Description"
              placeholder="Project Name/Description"
              value={text}
              onChangeText={setText}
              style={{ backgroundColor: "#81E7AF" }}
              underlineColor="#03A791"
              activeUnderlineColor="#03A791"
            />
          </View>

          {/* Search Button */}
          <View className="w-full">
            <Button
              mode="contained"
              onPress={handleSearch}
              buttonColor="#03A791"
            >
              Search
            </Button>
          </View>
        </View>
      </View>

      {/* Project Selection */}
      <View className="w-full mt-4">
        {projects.length > 0 ? (
          <View>
            <Picker
              selectedValue={selectedProjectId}
              onValueChange={(itemValue) => setSelectedProjectId(itemValue)}
              mode="dropdown"
              style={{ fontSize: 18 }}
              itemStyle={{ fontSize: 30 }}
            >
              <Picker.Item key={0} label="Select Project" value={null} />
              {projects?.map((project) => (
                <Picker.Item
                  key={project.projectId}
                  label={project.subject}
                  value={project.projectId}
                />
              ))}
            </Picker>
          </View>
        ) : (
          <View className="items-center justify-center py-4">
            <Text>No projects found</Text>
          </View>
        )}

        {/* Selected Project Details */}
        {selectedProject && (
          <View>
            <View>
              <TextInput
                label="Description"
                value={selectedProject?.description || ""}
                multiline={true}
                numberOfLines={4}
                mode="outlined"
                editable={false}
                style={{ backgroundColor: "#81E7AF" }}
                underlineColor="#03A791"
                activeUnderlineColor="#03A791"
              />
            </View>
            <View className="flex-row items-center justify-center w-full gap-2 px-5 mt-3">
              <Button
                onPress={onViewComplains}
                mode="contained"
                buttonColor="#03A791"
              >
                View Complains
              </Button>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
