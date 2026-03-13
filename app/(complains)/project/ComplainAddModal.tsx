import { useState } from "react";
import { View } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { addProjectComplain } from "../../../api/complainAction";
import { useAuthStore } from "../../../stores/authStore";

export default function ComplainAddModal({ project, onComplainAdded }) {
  const [complainText, setComplainText] = useState("");
  const [description, setDescription] = useState("");
  const { userInfo } = useAuthStore();

  async function addComplainHandler() {
    try {
      const complain = {
        subject: complainText,
        detail: description,
        residentId: userInfo?.sub,
        projectId: project.projectId,
      };

      console.log("Submitting complain:", project);

      const response = await addProjectComplain(complain);

      // Handle new ApiResponse structure

      if (!response.isSuccess) {
        console.error("Adding complain failed:", response.message);
        if (response.errors && response.errors.length > 0) {
          response.errors.forEach((error) => console.error(error));
        }
        return;
      }
      console.log("Complain added successfully:", response.data);

      // Reset form
      setComplainText("");
      setDescription("");

      // Notify parent component
      if (onComplainAdded) {
        onComplainAdded();
      }
    } catch (error) {
      console.error("Error adding complain:", error);
    }
  }
  return (
    <View
      className="flex-1 w-full justify-center items-center px-4 py-6 rounded-xl gap-4"
      style={{ backgroundColor: "#E9F5BE" }}
    >
      <View className="w-full">
        <TextInput
          label="Complain"
          value={complainText}
          onChangeText={setComplainText}
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
          value={description}
          onChangeText={setDescription}
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
      <View className="mt-4 w-full">
        <Button
          onPress={addComplainHandler}
          mode="contained"
          style={{ backgroundColor: "#03A791", borderRadius: 8 }}
          labelStyle={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}
        >
          Add Complain
        </Button>
      </View>
    </View>
  );
}
