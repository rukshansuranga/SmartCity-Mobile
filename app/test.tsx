import React from "react";
import { View } from "react-native";
import DocumentPickerTest from "../components/DocumentPickerTest";

export default function TestScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <DocumentPickerTest />
    </View>
  );
}
