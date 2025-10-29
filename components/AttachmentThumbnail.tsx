import React, { useEffect, useState } from "react";
import { Image, Text, View } from "react-native";

type Props = {
  item: any;
  width?: number;
};

const AttachmentThumbnail: React.FC<Props> = ({ item, width = 60 }) => {
  const [thumbUri, setThumbUri] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchThumb() {
      if (
        item.attachmentId ||
        (item.file && item.file.type?.startsWith("image"))
      ) {
        const uri = item.attachmentId ? item.thumbnailUrl : item.file.uri;
        console.log("Fetched thumbnail URI:", uri);

        if (isMounted) setThumbUri(uri);
      } else {
        setThumbUri(null);
      }
    }
    fetchThumb();
    return () => {
      isMounted = false;
    };
  }, [item.attachmentId, item.file, width]);

  console.log("Rendering AttachmentThumbnail with thumbUri:", thumbUri);

  const imageUrl = "https://reactnative.dev/img/tiny_logo.png"; // Example URI

  if (thumbUri) {
    return (
      <Image
        source={{ uri: thumbUri || imageUrl }}
        crossOrigin="anonymous"
        style={{
          width,
          height: width,
          borderRadius: 8,
          borderWidth: 2,
          borderColor: "#38a3a5",
          backgroundColor: "#80ed99",
        }}
        resizeMode="cover"
      />
    );
  }

  // Fallback for non-image files
  if (item.file?.type === "application/pdf") {
    return (
      <View
        style={{
          width,
          height: width,
          borderWidth: 2,
          borderColor: "#22577a",
          borderRadius: 8,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#80ed99",
          marginBottom: 4,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "bold", color: "#22577a" }}>
          PDF
        </Text>
      </View>
    );
  }
  if (item.file?.type?.includes("word")) {
    return (
      <View
        style={{
          width,
          height: width,
          borderWidth: 2,
          borderColor: "#22577a",
          borderRadius: 8,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#80ed99",
          marginBottom: 4,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "bold", color: "#22577a" }}>
          DOC
        </Text>
      </View>
    );
  }
  if (item.file && !item.file.type?.startsWith("image")) {
    return (
      <View
        style={{
          width,
          height: width,
          borderWidth: 2,
          borderColor: "#22577a",
          borderRadius: 8,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#80ed99",
          marginBottom: 4,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "bold", color: "#22577a" }}>
          FILE
        </Text>
      </View>
    );
  }
  return null;
};

export default AttachmentThumbnail;
