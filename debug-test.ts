// Debug test file for commentAction.ts
// You can set breakpoints in this file and in the imported functions

import { addComment } from "./api/commentAction";
import { Comment } from "./types";

async function testCommentAction() {
  console.log("Starting debug test for commentAction...");

  // Create a test comment object
  const testComment: Partial<Comment> = {
    text: "This is a test comment",
    complainId: 1,
    isPrivate: false,
    clientId: "test-client-123",
    // Add other properties as needed based on your Comment type
  };

  try {
    console.log("Calling addComment with:", testComment);

    // Set a breakpoint on the next line to step into the function
    const result = await addComment(testComment);

    console.log("Result:", result);
  } catch (error) {
    console.error("Error:", error);
  }
}

// Run the test function
testCommentAction();
