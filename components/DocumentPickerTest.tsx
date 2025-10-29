import * as DocumentPicker from "expo-document-picker";
import React, { useState } from "react";
import { ActivityIndicator, Button, Text, View } from "react-native";
import { simpleUpload } from "../api/attachmentActions";

export default function DocumentPickerTest() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const pickAndUpload = async () => {
    setStatus("");
    setLoading(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: false,
        type: "*/*",
      });
      if (result.canceled || !result.assets || !result.assets[0]) {
        setStatus("No file selected");
        setLoading(false);
        return;
      }
      const fileAsset = result.assets[0];
      // Convert to File object for FormData
      const file = {
        uri: fileAsset.uri,
        name: fileAsset.name || "document",
        type: fileAsset.mimeType || "application/octet-stream",
      };

      //can you create File object
      //   const file = new File([fileAsset.uri], fileAsset.name || "document", {
      //     type: fileAsset.mimeType || "application/octet-stream",
      //   });

      const uploadResult = await simpleUpload({ file });
      setStatus("Upload success: " + JSON.stringify(uploadResult));
    } catch (err) {
      setStatus("Upload failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Button
        title="Pick and Upload Document"
        onPress={pickAndUpload}
        disabled={loading}
      />
      {loading && <ActivityIndicator style={{ marginTop: 10 }} />}
      {!!status && <Text style={{ marginTop: 10 }}>{status}</Text>}
    </View>
  );
}
