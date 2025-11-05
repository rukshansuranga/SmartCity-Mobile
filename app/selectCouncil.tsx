import { useAuthStore } from "@/stores/authStore";
import { Council } from "@/types";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-paper";

export default function SelectCouncil() {
  const { councils, setSelectedCouncil } = useAuthStore();
  const router = useRouter();
  const [selectedValue, setSelectedValue] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleSelectCouncil = () => {
    if (!selectedValue) {
      setError("Please select a council to continue");
      return;
    }

    const selectedCouncil = councils?.find((c) => c.value === selectedValue);
    if (selectedCouncil) {
      console.log("[SelectCouncil] Council selected:", selectedCouncil);
      setSelectedCouncil(selectedCouncil);
      router.replace("/home");
    } else {
      setError("Invalid council selection");
    }
  };

  if (!councils || councils.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            No councils available. Please contact support.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Select Your Council</Text>
        <Text style={styles.subtitle}>
          Choose the local council you want to access. You can switch councils
          later from your profile.
        </Text>

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedValue}
            onValueChange={(itemValue) => {
              setSelectedValue(itemValue);
              setError("");
            }}
            style={styles.picker}
          >
            <Picker.Item label="-- Select a Council --" value="" />
            {councils.map((council: Council) => (
              <Picker.Item
                key={council.value}
                label={council.label}
                value={council.value}
              />
            ))}
          </Picker>
        </View>

        {error ? <Text style={styles.errorMessage}>{error}</Text> : null}

        <Button
          mode="contained"
          onPress={handleSelectCouncil}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#c7f9cc",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  content: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#22577a",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#57cc99",
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: "#f0f0f0",
  },
  picker: {
    height: 50,
  },
  errorMessage: {
    color: "#dc2626",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#38a3a5",
    borderRadius: 12,
    height: 56,
  },
  buttonContent: {
    height: 56,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  errorContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  errorText: {
    fontSize: 16,
    color: "#dc2626",
    textAlign: "center",
  },
});
