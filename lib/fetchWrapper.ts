//import { auth } from "@/auth";

import { useAuthStore } from "@/stores/authStore";
import { ApiResponse } from "@/types";
import Toast from "react-native-toast-message";
import { getValidAccessToken } from "./tokenManager";

//const baseUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
const baseUrl =
  "https://190f-2402-d000-8100-a06-7832-3d1e-f928-f4e0.ngrok-free.app/api/";

async function get(url: string) {
  const requestOptions = {
    method: "GET",
    headers: await getHeaders(),
  };

  const response = await fetch(baseUrl + url, requestOptions);
  return handleResponse(response);
}

async function put(url: string, body: unknown) {
  console.log("🔵 PUT Request:", baseUrl + url);
  console.log("🔵 PUT Body:", JSON.stringify(body, null, 2));
  const requestOptions = {
    method: "PUT",
    headers: await getHeaders(),
    body: JSON.stringify(body),
  };
  const response = await fetch(baseUrl + url, requestOptions);
  console.log("🔵 PUT Response Status:", response.status);
  return handleResponse(response);
}

async function patch(url: string, body: unknown) {
  const requestOptions = {
    method: "PATCH",
    headers: await getHeaders(),
    body: JSON.stringify(body),
  };
  const response = await fetch(baseUrl + url, requestOptions);
  return handleResponse(response);
}

async function post(url: string, body: unknown) {
  const requestOptions = {
    method: "POST",
    headers: await getHeaders(),
    body: JSON.stringify(body),
  };
  const response = await fetch(baseUrl + url, requestOptions);
  return handleResponse(response);
}

async function del(url: string) {
  const requestOptions = {
    method: "DELETE",
    headers: await getHeaders(),
  };
  const response = await fetch(baseUrl + url, requestOptions);
  return handleResponse(response);
}

// Helper function to convert object to FormData
function objectToFormData(obj: Record<string, unknown>): FormData {
  const formData = new FormData();

  Object.keys(obj).forEach((key) => {
    const value = obj[key];

    if (value instanceof File) {
      // Handle File objects
      formData.append(key, value);
    } else if (value instanceof Date) {
      // Handle Date objects - convert to ISO string
      formData.append(key, value.toISOString());
    } else if (Array.isArray(value)) {
      // Handle arrays - append each item with array notation
      value.forEach((item, index) => {
        if (item instanceof File) {
          formData.append(`${key}[${index}]`, item);
        } else if (item !== null && item !== undefined) {
          formData.append(`${key}[${index}]`, String(item));
        }
      });
    } else if (value !== null && value !== undefined) {
      // Handle other values (strings, numbers, booleans)
      formData.append(key, String(value));
    }
    // Skip null/undefined values
  });

  return formData;
}

// Generic method to post FormData
async function postFormData(
  url: string,
  data: FormData | Record<string, unknown>,
) {
  const formData = data instanceof FormData ? data : objectToFormData(data);
  const requestOptions = {
    method: "POST",
    headers: await getFormDataHeaders(),
    body: formData,
  };
  const response = await fetch(baseUrl + url, requestOptions);
  return handleResponse(response);
}

// Generic method to put FormData
async function putFormData(
  url: string,
  data: FormData | Record<string, unknown>,
) {
  const formData = data instanceof FormData ? data : objectToFormData(data);

  const requestOptions = {
    method: "PUT",
    headers: await getFormDataHeaders(),
    body: formData,
  };
  const response = await fetch(baseUrl + url, requestOptions);
  return handleResponse(response);
}

// Generic method to patch FormData
async function patchFormData(
  url: string,
  data: FormData | Record<string, unknown>,
) {
  const formData = data instanceof FormData ? data : objectToFormData(data);

  const requestOptions = {
    method: "PATCH",
    headers: await getFormDataHeaders(),
    body: formData,
  };
  const response = await fetch(baseUrl + url, requestOptions);
  return handleResponse(response);
}

async function handleResponse(response: Response): Promise<any> {
  const text = await response.text();

  //console.log("Response text:", text);

  let data: ApiResponse<any>;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // If parsing fails, create a generic error response
    const errorMessage = typeof text === "string" ? text : response.statusText;
    Toast.show({
      type: "error",
      text1: "Error",
      text2: errorMessage,
    });
    throw new Error(errorMessage);
  }

  if (response.ok) {
    // Check if response follows the new ApiResponse structure
    if (data && typeof data === "object" && "isSuccess" in data) {
      if (!data.isSuccess) {
        const errorMessage = data.message || "Operation failed";
        if (data.errors && data.errors.length > 0) {
          data.errors.forEach((error) =>
            Toast.show({
              type: "error",
              text1: "Error",
              text2: error,
            }),
          );
        } else {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: errorMessage,
          });
        }
        throw new Error(errorMessage);
      }
      // Return the full ApiResponse for successful response
      return data;
    }
    // For backwards compatibility, return data as-is if not ApiResponse structure
    return data || response.statusText;
  } else {
    const errorMessage =
      data?.message || (typeof data === "string" ? data : response.statusText);
    Toast.show({
      type: "error",
      text1: "Error",
      text2: errorMessage,
    });

    const error = {
      status: response.status,
      message: errorMessage,
    };
    throw error;
  }
}

async function getHeaders(): Promise<Headers> {
  // Validate and refresh token if needed
  const accessToken = await getValidAccessToken();
  const { selectedCouncil } = useAuthStore.getState();

  console.log(
    "🔑 Selected Council:",
    selectedCouncil?.value,
    selectedCouncil?.label,
  );

  const headers = new Headers();
  headers.set("Content-type", "application/json");

  if (accessToken) {
    headers.set("Authorization", "Bearer " + accessToken);
  }

  // Add council ID header if council is selected
  if (selectedCouncil?.value) {
    headers.set("X-Council-Id", selectedCouncil.value);
    console.log("🔑 Sending X-Council-Id header:", selectedCouncil.value);
  }

  return headers;
}

// Headers for FormData requests (don't set Content-Type, let browser set it with boundary)
async function getFormDataHeaders(): Promise<Headers> {
  // Validate and refresh token if needed
  const accessToken = await getValidAccessToken();
  const { selectedCouncil } = useAuthStore.getState();

  const headers = new Headers();
  headers.set("Content-type", "multipart/form-data");
  // Don't set Content-Type for FormData - browser will set it automatically with boundary

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  // Add council ID header if council is selected
  if (selectedCouncil?.value) {
    headers.set("X-Council-Id", selectedCouncil.value);
  }

  return headers;
}

// Method to fetch a file (e.g., image, PDF, etc.) as a Blob
async function getFile(url: string): Promise<Blob> {
  const requestOptions = {
    method: "GET",
    headers: await getHeaders(),
  };
  const response = await fetch(baseUrl + url, requestOptions);
  if (!response.ok) {
    const errorMessage = response.statusText || "Failed to fetch file";
    Toast.show({
      type: "error",
      text1: "Error",
      text2: errorMessage,
    });
    throw new Error(errorMessage);
  }
  return await response.blob();
}

function getServerUrl() {
  return baseUrl;
}

export const fetchWrapper = {
  get,
  post,
  put,
  patch,
  del,
  postFormData,
  putFormData,
  patchFormData,
  objectToFormData,
  getFile,
  getServerUrl,
};
