import {
  deleteProjectComplain,
  getProjectComplainsByProjectId,
  updateProjectComplain,
} from "@/api/complainAction";
import { WorkpackageStatus } from "@/enums/enum";
import { useAuthStore } from "@/stores/authStore";
import { ProjectComplain } from "@/types";
import { useCallback, useEffect, useState } from "react";
import { FlatList, View } from "react-native";
import {
  Badge,
  Button,
  Card,
  FAB,
  IconButton,
  Text,
  TextInput,
} from "react-native-paper";
import ComplainAddModal from "./ComplainAddModal";

// Edit form component
function ComplainEditForm({ complain, project, onUpdate, onCancel }) {
  const [subject, setSubject] = useState(complain.subject || "");
  const [detail, setDetail] = useState(complain.detail || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    console.log("Submitting update for complain ID:", complain.complainId);
    // Ensure complainId is a number
    const complainIdNum =
      typeof complain.complainId === "string"
        ? parseInt(complain.complainId, 10)
        : complain.complainId;
    await onUpdate(complainIdNum, subject, detail);
    setIsSubmitting(false);
  };

  return (
    <View
      className="flex-1 w-full justify-center items-center px-4 py-6 rounded-xl gap-4"
      style={{ backgroundColor: "#E9F5BE" }}
    >
      <View className="w-full">
        <TextInput
          label="Complain"
          value={subject}
          onChangeText={setSubject}
          style={{
            backgroundColor: "#81E7AF",
            color: "#03A791",
            borderRadius: 8,
            fontWeight: "bold",
          }}
          underlineColor="#03A791"
          activeUnderlineColor="#03A791"
        />
      </View>
      <View className="w-full h-36">
        <TextInput
          className="h-full"
          label="Description"
          value={detail}
          onChangeText={setDetail}
          multiline
          editable
          numberOfLines={4}
          style={{
            backgroundColor: "#81E7AF",
            color: "#03A791",
            borderRadius: 8,
            fontWeight: "bold",
            height: "100%",
          }}
          underlineColor="#03A791"
          activeUnderlineColor="#03A791"
        />
      </View>
      <View className="mt-4 w-full flex-row gap-2">
        <Button
          onPress={onCancel}
          mode="outlined"
          style={{ flex: 1 }}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          onPress={handleSubmit}
          mode="contained"
          style={{ flex: 1, backgroundColor: "#03A791" }}
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          Update
        </Button>
      </View>
    </View>
  );
}

export default function ComplainListModel({ project }) {
  const [data, setData] = useState([]);
  const [mode, setMode] = useState<"list" | "add" | "edit">("list");
  const [editingComplain, setEditingComplain] =
    useState<ProjectComplain | null>(null);
  const { userInfo } = useAuthStore();

  const fetchComplainList = useCallback(async () => {
    try {
      console.log("Fetching complain list for project ID:", project.projectId);
      const response = await getProjectComplainsByProjectId(project.projectId);

      if (!response.isSuccess) {
        console.error("Fetching complain list failed:", response.message);
        setData([]);
        return;
      }

      setData(response.data || []);
    } catch (error) {
      console.log("fetch active complains", error?.message);
      setData([]);
    }
  }, [project.projectId]);

  useEffect(() => {
    // Fetch data or perform any side effects here
    fetchComplainList();
  }, [fetchComplainList]);

  async function handleDelete(complainId) {
    try {
      const deleteResponse = await deleteProjectComplain(complainId);

      if (!deleteResponse.isSuccess) {
        console.error("Deleting complain failed:", deleteResponse.message);
        return;
      }

      // Refresh the list after successful deletion
      await fetchComplainList();
    } catch (error) {
      console.log("Error deleting complain:", error.message);
    }
  }

  const handleEdit = (complain: ProjectComplain) => {
    setEditingComplain(complain);
    setMode("edit");
  };

  const handleUpdate = async (
    complainId: number,
    subject: string,
    detail: string,
  ) => {
    try {
      const response = await updateProjectComplain(complainId, {
        subject,
        detail,
        projectId: project.projectId,
      });

      if (!response.isSuccess) {
        console.error("Updating complain failed:", response.message);
        console.error("Full response:", JSON.stringify(response, null, 2));
        return false;
      }

      console.log("Complain updated successfully:", response.data);

      // Switch back to list and refresh
      setMode("list");
      setEditingComplain(null);
      await fetchComplainList();
      return true;
    } catch (error) {
      console.error("Error updating complain:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      return false;
    }
  };

  function itemRender({ item }) {
    // Check if this complain belongs to current user and is in New status
    const isOwnComplain = item.residentId === userInfo?.sub;
    const isNewStatus = item.status === WorkpackageStatus.New;
    const canModify = isOwnComplain && isNewStatus;

    return (
      <Card className="w-full mt-2">
        <View className="flex-row items-center mx-5 p-4">
          <View className={canModify ? "w-9/12 gap-4" : "w-10/12 gap-4"}>
            <View className="flex-row gap-6">
              <Badge size={30} style={{ backgroundColor: "green" }}>
                {item.complainId}
              </Badge>
              <Text>{item.subject}</Text>
            </View>
            <View className="flex-row justify-between">
              {item?.ticketPackages?.map((ticket) => (
                <Text key={ticket?.ticket?.ticketId}>
                  {ticket?.ticket?.title}
                </Text>
              ))}

              <Text>2026-1-2</Text>
            </View>
            {isOwnComplain && (
              <View className="mt-1">
                <Badge size={20} style={{ backgroundColor: "#2563eb" }}>
                  Your Complain
                </Badge>
              </View>
            )}
          </View>
          {canModify ? (
            <View className="flex-row justify-end w-3/12 gap-1">
              <IconButton
                icon="pencil"
                size={20}
                onPress={() => handleEdit(item)}
              />
              <IconButton
                icon="delete"
                size={20}
                onPress={() => handleDelete(item.complainId)}
              />
            </View>
          ) : null}
        </View>
      </Card>
    );
  }

  const handleComplainAdded = () => {
    // Switch back to list view and refresh
    setMode("list");
    fetchComplainList();
  };

  // If in edit mode, show the edit form
  if (mode === "edit" && editingComplain) {
    return (
      <View className="flex-1">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-xl font-bold text-gray-700">Edit Complain</Text>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={() => {
              setMode("list");
              setEditingComplain(null);
            }}
          />
        </View>
        <ComplainEditForm
          complain={editingComplain}
          project={project}
          onUpdate={handleUpdate}
          onCancel={() => {
            setMode("list");
            setEditingComplain(null);
          }}
        />
      </View>
    );
  }

  // If in add mode, show the add form
  if (mode === "add") {
    return (
      <View className="flex-1">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-xl font-bold text-gray-700">
            Add New Complain
          </Text>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={() => setMode("list")}
          />
        </View>
        <ComplainAddModal
          project={project}
          onComplainAdded={handleComplainAdded}
        />
      </View>
    );
  }

  // Default list mode
  return (
    <View className="flex-1">
      <View className="mb-4">
        <Text className="text-xl font-bold text-gray-700">
          Complains for {project?.projectName || "Project"}
        </Text>
        <Text className="text-sm text-gray-500 mt-1">
          {data.length} complain{data.length !== 1 ? "s" : ""} found
        </Text>
      </View>

      <FlatList
        data={data}
        renderItem={itemRender}
        keyExtractor={(item, index) => item.complainId.toString()}
        contentContainerStyle={{ paddingBottom: 80 }}
        ListEmptyComponent={
          <View className="items-center justify-center py-12">
            <Text className="text-gray-500 text-center">
              No complains yet.{"\n"}Tap the + button to add one.
            </Text>
          </View>
        }
      />

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        style={{
          position: "absolute",
          margin: 16,
          right: 0,
          bottom: 0,
          backgroundColor: "#22577a",
        }}
        onPress={() => setMode("add")}
        label="Add Complain"
      />
    </View>
  );
}
