import Input from "@/components/forms/Input";
import { useAuthStore } from "@/stores/authStore";
import { User } from "@/types/type";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import * as z from "zod";

const schema = z.object({
  username: z.string().trim().min(1, "Username is required"),
  email: z.string().trim().min(1, "Email is required").email("Invalid email"),
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  council: z.string().trim().min(1, "Councilor name is required"),
  mobile: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "Mobile number must be 10 digits")
    .optional(),
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#c7f9cc", // Light mint background
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    backgroundColor: "#22577a", // Dark blue-green
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#c7f9cc",
    textAlign: "center",
  },
  formContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#80ed99",
  },
  inputGroup: {
    marginBottom: 15,
  },
  buttonContainer: {
    marginTop: 20,
    marginHorizontal: 20,
  },
  submitButton: {
    backgroundColor: "#38a3a5", // Teal
    borderRadius: 12,
    paddingVertical: 4,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
  },
});

export default function EditUser() {
  const router = useRouter();

  const [selectedUser, setSelectedUser] = useState<User | null>({
    email: "",
    username: "",
    firstName: "",
    lastName: "",
    council: "",
    mobile: "",
  });
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const { userInfo } = useAuthStore();

  console.log("User Info:", userInfo);

  const {
    control,
    handleSubmit,
    reset,
    // formState: { errors },
  } = useForm<User>({
    resolver: zodResolver(schema),
    mode: "onChange",
    values: {
      username: selectedUser[0]?.username || "",
      email: selectedUser[0]?.email || "",
      firstName: selectedUser[0]?.firstName || "",
      lastName: selectedUser[0]?.lastName || "",
      council: selectedUser[0]?.attributes?.council[0] || "",
      mobile: selectedUser[0]?.attributes?.mobile[0] || "",
    },
  });

  function addUser(data: User) {
    console.log("User data submitted:", data);
    if (
      selectedUser &&
      Array.isArray(selectedUser) &&
      selectedUser[0]?.username
    ) {
      console.log("Updating user:", selectedUser[0].username, data);
      updateUser(selectedUser[0].id, data);
    }
  }

  const updateUser = async (userId: string, updatedData: User) => {
    try {
      const token = await fetchAdminToken();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_ADMIN_KEYCLOAK_URL}/users/${userInfo?.sub}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            firstName: updatedData.firstName,
            lastName: updatedData.lastName,
            email: updatedData.email,
            username: updatedData.username,
            attributes: {
              council: [updatedData.council],
              mobile: [updatedData.mobile],
            },
          }),
        }
      );
      if (response.ok) {
        console.log("User updated successfully");
      } else {
        const error = await response.text();
        console.error("Failed to update user:", error);
        return;
      }
      // Navigate to home page after successful update
      router.replace("/");
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  useEffect(() => {
    fetchUser(userInfo?.preferred_username);
    // Reset the form when the component mounts or when the user data changes
  }, []);

  const fetchAdminToken = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_KEYCLOAK_URL}/protocol/openid-connect/token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: `grant_type=client_credentials&client_id=${process.env.EXPO_PUBLIC_KEYCLOAK_ADMIN_CLIENT_ID}&client_secret=${process.env.EXPO_PUBLIC_KEYCLOAK_ADMIN_CLIENT_SECRET}`,
        }
      );
      const data = await response.json();
      //console.log("User data submittedxxx:", data);
      setAdminToken(data.access_token);
      return data.access_token;
    } catch (error) {
      console.error("Error fetching admin token:", error);
    }
  };

  const fetchUser = async (userName: string) => {
    //console.log("Fetching user:", userName);
    try {
      const token = await fetchAdminToken();
      //console.log("Admin Token:", token);
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_ADMIN_KEYCLOAK_URL}/users?username=${userName}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const newData = await response.json();
      setSelectedUser(newData);
      //console.log("Fetched user data:", newData[0]?.attributes, userName);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Form Section */}
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Input
                label="User Name"
                type="text"
                placeholder="Enter User Name"
                name="username"
                control={control}
              />
            </View>

            <View style={styles.inputGroup}>
              <Input
                label="Email"
                type="text"
                placeholder="Enter Email"
                name="email"
                control={control}
              />
            </View>

            <View style={styles.inputGroup}>
              <Input
                label="First Name"
                type="text"
                placeholder="Enter First Name"
                name="firstName"
                control={control}
              />
            </View>

            <View style={styles.inputGroup}>
              <Input
                label="Last Name"
                type="text"
                placeholder="Enter Last Name"
                name="lastName"
                control={control}
              />
            </View>

            <View style={styles.inputGroup}>
              <Input
                label="Councilor Name"
                type="text"
                placeholder="Enter Councilor Name"
                name="council"
                control={control}
              />
            </View>

            <View style={styles.inputGroup}>
              <Input
                label="Mobile Number"
                type="text"
                placeholder="Enter Mobile Number"
                name="mobile"
                control={control}
              />
            </View>
          </View>

          {/* Button Section */}
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleSubmit(addUser)}
              style={styles.submitButton}
              labelStyle={styles.buttonLabel}
            >
              Update Profile
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
