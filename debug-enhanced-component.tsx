// Enhanced AddGeneralComplain.tsx with debugging
// Copy this code to your AddGeneralComplain.tsx file

import { addGeneralComplain } from "@/api/complainAction";
import { WorkpackageStatus } from "@/enums/enum";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Button, Checkbox, TextInput } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function AddGeneralComplain() {
  const router = useRouter();
  const { userInfo } = useAuthStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);

  async function addGeneralComplainHandler() {
    // 🔍 Debug logging - check Metro console
    console.log("🚀 AddGeneralComplain: Starting submission");
    console.log("👤 User info:", userInfo);
    console.log("📝 Form data:", { title, description, isPrivate });

    // 🛑 Uncomment the next line to pause execution in Chrome DevTools
    // debugger;

    try {
      const complain = {
        clientId: userInfo?.sub,
        subject: title,
        detail: description,
        isPrivate: isPrivate,
        status: WorkpackageStatus.New,
      };

      console.log("📤 Sending complain request:", complain);

      // 🛑 Another debug point - uncomment to pause before API call
      // debugger;

      const result = await addGeneralComplain(complain);

      console.log("📥 API Response:", result);

      if (!result.isSuccess) {
        console.error("❌ Failed to add general complain:", result.message);
        console.error("🔍 Error details:", result.errors);
        return;
      }

      console.log("✅ Complain added successfully:", result.data);

      // 🛑 Debug navigation - uncomment to pause before navigation
      // debugger;

      router.push({
        pathname: "/(complains)/general/GeneralComplainList",
        params: {
          isPrivate: isPrivate.toString(),
          random: Math.random() * 10000,
        },
      });

      console.log("🧭 Navigation completed");
    } catch (error) {
      console.error("❌ Unexpected error in addGeneralComplainHandler:", error);
      console.error("🔍 Error stack:", error.stack);

      // You can also add more specific error handling
      if (error.message.includes("network")) {
        console.error("🌐 Network error detected");
      }
    }
  }

  // 🔍 Debug component state changes
  const handleTitleChange = (value: string) => {
    console.log("📝 Title changed:", value);
    setTitle(value);
  };

  const handleDescriptionChange = (value: string) => {
    console.log("📝 Description changed:", value.length, "characters");
    setDescription(value);
  };

  const handlePrivateChange = () => {
    const newValue = !isPrivate;
    console.log("🔐 Privacy setting changed:", newValue);
    setIsPrivate(newValue);
  };

  // 🔍 Debug render
  console.log("🎨 AddGeneralComplain component rendered");

  return (
    <SafeAreaProvider>
      {/* Your existing JSX here - just replace the handlers */}
      <TextInput
        label="Title"
        value={title}
        onChangeText={handleTitleChange} // Use the debug version
        mode="outlined"
      />

      <TextInput
        label="Description"
        value={description}
        onChangeText={handleDescriptionChange} // Use the debug version
        mode="outlined"
        multiline
      />

      <Checkbox.Item
        label="Private Complain"
        status={isPrivate ? "checked" : "unchecked"}
        onPress={handlePrivateChange} // Use the debug version
      />

      <Button mode="contained" onPress={addGeneralComplainHandler}>
        Submit Complain
      </Button>
    </SafeAreaProvider>
  );
}
