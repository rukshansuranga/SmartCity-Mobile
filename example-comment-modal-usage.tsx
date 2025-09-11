import { CommentModal } from "@/components/CommentModal";
import { Comment, EntityType } from "@/types";
import React, { useState } from "react";
import { Text, View } from "react-native";
import { Button } from "react-native-paper";

// Example usage of the updated CommentModal
export const ExampleCommentModalUsage: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);

  // Example data structure
  const exampleComplain = {
    complainId: 123,
    subject: "Street light not working",
    detail: "The street light on Main Street has been broken for a week",
    status: 0, // New
    clientId: "client123",
    client: {
      firstName: "John",
      lastName: "Doe",
      mobile: "123-456-7890",
    },
    createdAt: new Date().toISOString(),
    // Initial comments that come with the complain data
    comments: [
      {
        commentId: 1,
        text: "We have received your complaint and will investigate soon.",
        entityType: EntityType.GeneralComplain,
        entityId: "123",
        isPrivate: false,
        userId: "admin123",
        user: {
          firstName: "Admin",
          lastName: "User",
          name: "Admin User",
        },
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      },
      {
        commentId: 2,
        text: "Our team has inspected the area. Repair will be scheduled.",
        entityType: EntityType.GeneralComplain,
        entityId: "123",
        isPrivate: false,
        userId: "tech123",
        user: {
          firstName: "Tech",
          lastName: "Support",
          name: "Tech Support",
        },
        createdAt: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
      },
    ] as Comment[],
  };

  const handleCommentAdded = () => {
    console.log("Comment added successfully!");
    // You can refresh the parent data here
    // fetchComplainsData();
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 18, marginBottom: 20 }}>
        Example CommentModal Usage
      </Text>

      <Button
        mode="contained"
        onPress={() => setModalVisible(true)}
        style={{ backgroundColor: "#57cc99" }}
      >
        Open Comments for Complain #{exampleComplain.complainId}
      </Button>

      <CommentModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        commentList={exampleComplain.comments || []}
        entityId={exampleComplain.complainId.toString()}
        entityType={EntityType.GeneralComplain}
        onCommentAdded={handleCommentAdded}
      />
    </View>
  );
};

/* 
How to use the updated CommentModal:

1. Required Props:
   - visible: boolean - Controls modal visibility
   - onClose: () => void - Function to close the modal
   - selectedItem: any - The main entity (complain, project, etc.)
   - commentList: Comment[] - Array of initial comments
   - entityId: string - ID of the entity the comments belong to
   - entityType: EntityType - Type of entity (GeneralComplain, LightpostComplain, etc.)

2. Optional Props:
   - onCommentAdded?: () => void - Callback when a comment is added

3. Key Features:
   - Shows initial comments from commentList prop
   - Allows adding new comments
   - Edit/Delete buttons for comments owned by current user
   - Form switches between Add and Edit mode
   - Fallback to fetch comments if commentList is empty

4. Benefits:
   - Better performance: Uses initial data instead of always fetching
   - More flexible: Can work with any entity type
   - Cleaner interface: Removed isPrivate dependency
   - Better UX: Shows comments immediately from cached data

5. Usage Pattern:
   ```tsx
   // In your complain list component
   const [selectedComplain, setSelectedComplain] = useState(null);
   const [modalVisible, setModalVisible] = useState(false);
   
   const openComments = (complain) => {
     setSelectedComplain(complain);
     setModalVisible(true);
   };
   
   <CommentModal
     visible={modalVisible}
     onClose={() => setModalVisible(false)}
     selectedItem={selectedComplain}
     commentList={selectedComplain?.comments || []}
     entityId={selectedComplain?.complainId?.toString() || ""}
     entityType={EntityType.GeneralComplain}
     onCommentAdded={() => {
       // Refresh your data here
       fetchComplains();
     }}
   />
   ```
*/

export default ExampleCommentModalUsage;
