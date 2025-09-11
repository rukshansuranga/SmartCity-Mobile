import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { addProjectComplain } from "../../../api/complainAction";
import { useAuthStore } from "../../../stores/authStore";

export default function ComplainAddModal({ project, closeModel }) {
  const router = useRouter();

  const [complainText, setComplainText] = useState("");
  const [description, setDescription] = useState("");
  const { userInfo } = useAuthStore();

  async function addComplainHandler() {
    try {
      // const res = await fetch(
      //   `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/complain/projectcomplain`,
      //   {
      //     method: "POST",
      //     headers: {
      //       Accept: "application/json",
      //       "Content-Type": "application/json",
      //     },
      //     body: JSON.stringify({
      //       subject: complainText,
      //       detail: description,
      //       clientId: 1,
      //       projectId: project.id,
      //     }),
      //   }
      // );

      const complain = {
        subject: complainText,
        detail: description,
        clientId: userInfo?.sub,
        projectId: project.id,
      };

      console.log("Submitting complain:", complain);

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

      closeModel(false);
    } catch (error) {
      console.error("Error adding complain:", error);
    }
  }
  return (
    <View className="flex-1 w-full justify-center items-center bg-[#c7f9cc] px-4 py-6 rounded-xl gap-4">
      <View className="w-full">
        <TextInput
          label="Complain"
          value={complainText}
          onChangeText={setComplainText}
          style={{
            backgroundColor: "#80ed99",
            color: "#22577a",
            borderRadius: 8,
            fontWeight: "bold",
          }}
          underlineColor="#38a3a5"
          activeUnderlineColor="#38a3a5"
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
            backgroundColor: "#80ed99",
            color: "#22577a",
            borderRadius: 8,
            fontWeight: "bold",
            height: "100%",
          }}
          underlineColor="#38a3a5"
          activeUnderlineColor="#38a3a5"
        />
      </View>
      <View className="mt-4 w-full">
        <Button
          onPress={addComplainHandler}
          mode="contained"
          style={{ backgroundColor: "#38a3a5", borderRadius: 8 }}
          labelStyle={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}
        >
          Add Complain
        </Button>
      </View>
    </View>
  );
}
