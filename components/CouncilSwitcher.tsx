import { useAuthStore } from "@/stores/authStore";
import { Council } from "@/types";
import { Picker } from "@react-native-picker/picker";
import { useState } from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
import { Button, IconButton } from "react-native-paper";

interface CouncilSwitcherProps {
  visible: boolean;
  onDismiss: () => void;
}

export default function CouncilSwitcher({
  visible,
  onDismiss,
}: CouncilSwitcherProps) {
  const { councils, selectedCouncil, setSelectedCouncil } = useAuthStore();
  const [tempSelection, setTempSelection] = useState<string>(
    selectedCouncil?.value || ""
  );

  const handleSwitch = () => {
    const newCouncil = councils?.find((c) => c.value === tempSelection);
    if (newCouncil) {
      console.log("[CouncilSwitcher] Switching to council:", newCouncil);
      setSelectedCouncil(newCouncil);
      onDismiss();
    }
  };

  if (!councils || councils.length === 0) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.backdrop}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Switch Council</Text>
            <IconButton icon="close" size={24} onPress={onDismiss} />
          </View>

          <Text style={styles.currentText}>
            Current: {selectedCouncil?.label}
          </Text>

          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={tempSelection}
              onValueChange={(itemValue) => setTempSelection(itemValue)}
              style={styles.picker}
            >
              {councils.map((council: Council) => (
                <Picker.Item
                  key={council.value}
                  label={council.label}
                  value={council.value}
                />
              ))}
            </Picker>
          </View>

          <View style={styles.buttonRow}>
            <Button
              mode="outlined"
              onPress={onDismiss}
              style={styles.cancelButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSwitch}
              style={styles.switchButton}
              disabled={tempSelection === selectedCouncil?.value}
            >
              Switch
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  container: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#22577a",
  },
  currentText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#57cc99",
    borderRadius: 12,
    marginBottom: 24,
    backgroundColor: "#f0f0f0",
  },
  picker: {
    height: 50,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderColor: "#57cc99",
  },
  switchButton: {
    flex: 1,
    backgroundColor: "#38a3a5",
  },
});
