"use client";

import { EntityType } from "@/enums/enum";
import { fetchWrapper } from "@/lib/fetchWrapper";
import { ApiResponse, Attachment, AttachmentUpload } from "@/types";

// Client-side attachment upload function
export async function uploadAttachmentsClient(
  entityType: EntityType,
  entityId: number,
  attachments: AttachmentUpload[]
): Promise<ApiResponse<Attachment[]>> {
  try {
    // Check if attachments is valid
    if (
      !attachments ||
      !Array.isArray(attachments) ||
      attachments.length === 0
    ) {
      return {
        isSuccess: false,
        message: "No attachments provided",
        data: [],
        errors: ["No attachments to upload"],
      };
    }

    // Prepare FormData for bulk upload
    const formData = new FormData();

    // Add files and their metadata arrays
    const descriptions: string[] = [];

    attachments.forEach((attachment, index) => {
      console.log(`Processing attachment ${index}:`, attachment);

      if (!attachment.file) {
        console.error(`Attachment ${index} has no file:`, attachment);
        throw new Error(`Attachment at index ${index} is missing file`);
      }

      // Append files - the backend expects IEnumerable<IFormFile> Files
      console.log(`Appending file for attachment ${index}:`, attachment.file);
      //formData.append("Files", { ...attachment.file });
      formData.append("Files", {
        uri: attachment.file.uri,
        name: attachment.file.name,
        type: attachment.file.type,
      });
      //type: "image/jpeg",
      // Collect metadata for arrays
      descriptions.push(attachment.description || "");
    });

    // Append metadata arrays - the backend expects IEnumerable<string> for each
    descriptions.forEach((desc) => {
      formData.append("Descriptions", desc);
    });

    // Add optional settings
    formData.append("ContinueOnError", "true");

    console.log(
      `Making bulk upload request to: attachments/${entityType}/${entityId}/bulk`
    );

    const response = await fetchWrapper.postFormData(
      `attachments/${entityType}/${entityId}/bulk`,
      formData
    );

    console.log("Bulk upload server response:", response);

    // Transform the bulk upload response to match the expected ApiResponse<Attachment[]> format
    if (response.isSuccess && response.data) {
      const bulkResult = response.data;

      return {
        isSuccess: bulkResult.successCount > 0,
        message:
          bulkResult.summary ||
          `Successfully uploaded ${bulkResult.successCount} of ${bulkResult.totalFiles} files`,
        data: bulkResult.successfulUploads || [],
        errors: bulkResult.hasErrors
          ? bulkResult.errors?.map(
              (err: { FileName: string; Error: string }) =>
                `${err.FileName}: ${err.Error}`
            ) || []
          : [],
      };
    } else {
      return {
        isSuccess: false,
        message: response.message || "Failed to upload attachments",
        data: [],
        errors: response.errors || ["Unknown error occurred"],
      };
    }
  } catch (error) {
    console.error("Error uploading attachments:", error);
    return {
      isSuccess: false,
      message: "Failed to upload attachments",
      data: [],
      errors: [error instanceof Error ? error.message : "Unknown error"],
    };
  }
}

export async function uploadAttachment({
  entityType,
  entityId,
  file,
}: {
  entityType: EntityType;
  entityId: number;
  file: File;
}) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetchWrapper.postFormData(
    `attachments/${entityType}/${entityId}`,
    formData
  );

  if (!response.ok) {
    throw new Error("Failed to upload attachment");
  }
  return await response.json();
}

export async function simpleUpload({ file }) {
  const formData = new FormData();

  const files = [file]; // File objects from an <input type="file" multiple>
  const descriptions = ["desc1"];

  // Append each file
  files.forEach((file) => {
    formData.append("Files", file);
  });

  // Append each description
  descriptions.forEach((desc) => {
    formData.append("Descriptions", desc);
  });

  const response = await fetchWrapper.postFormData(`test/upload`, formData);

  if (!response.ok) {
    throw new Error("Failed to upload attachment");
  }
  return await response.json();
}

// Client-side get attachments function
export async function getAttachmentsClient(
  entityType: EntityType,
  entityId: number
): Promise<ApiResponse<Attachment[]>> {
  try {
    const response = await fetchWrapper.get(
      `attachments/${entityType}/${entityId}`
    );

    return response;
  } catch (error) {
    console.error("Error fetching attachments:", error);
    return {
      isSuccess: false,
      message: "Failed to fetch attachments",
      data: [],
      errors: [error instanceof Error ? error.message : "Unknown error"],
    };
  }
}

export async function deleteAttachment(id: number): Promise<ApiResponse<void>> {
  return fetchWrapper.del(`attachments/${id}`);
}

export async function UpdateAttachments(
  request: AttachmentUpload[]
): Promise<ApiResponse<string>> {
  return fetchWrapper.post("attachments/updateAttachments", request);
}

// Get thumbnail for an attachment (by id or local file)
// Usage: pass { attachmentId } for backend, or { file } for local
// export async function getAttachmentThumbnail(
//   params: { attachmentId?: number; file?: { uri: string } },
//   width: number = 100
// ): Promise<string | null> {
//   if (params.attachmentId) {
//     try {
//       // Fetch the file as a Blob
//       const blob = await fetchWrapper.getFile(
//         `attachments/${params.attachmentId}/thumbnail?width=${width}`
//       );
//       // Convert Blob to base64
//       const base64 = await blobToBase64(blob);
//       // Get content type from blob or default to png
//       const contentType = blob.type || "image/png";
//       return `data:${contentType};base64,${base64}`;
//     } catch (error) {
//       console.error("Error fetching attachment thumbnail:", error);
//       return null;
//     }
//   } else if (params.file?.uri) {
//     // Local file picked from device
//     return params.file.uri;
//   }
//   return null;
// }

export async function getVideo(params: {
  attachmentId?: number;
  file?: { uri: string };
}): Promise<string | null> {
  if (params.attachmentId) {
    try {
      // Fetch the file as a Blob
      const blob = await fetchWrapper.getFile(
        `attachments/${params.attachmentId}/video`
      );
      // Convert Blob to base64
      const base64 = await blobToBase64(blob);
      // Get content type from blob or default to png
      const contentType = blob.type || "image/png";
      return `data:${contentType};base64,${base64}`;
    } catch (error) {
      console.error("Error fetching attachment thumbnail:", error);
      return null;
    }
  } else if (params.file?.uri) {
    // Local file picked from device
    return params.file.uri;
  }
  return null;
}

// Helper to convert Blob to base64 (works in React Native with FileReader polyfill)
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result;
      // result is like: data:<type>;base64,<base64> or just base64 string
      if (typeof base64data === "string") {
        // Remove data:*/*;base64, if present
        const commaIdx = base64data.indexOf(",");
        resolve(commaIdx >= 0 ? base64data.slice(commaIdx + 1) : base64data);
      } else {
        reject("Failed to convert blob to base64");
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
