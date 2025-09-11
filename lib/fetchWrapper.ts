//import { auth } from "@/auth";

import { useAuthStore } from "@/stores/authStore";
import { ApiResponse } from "@/types";
import Toast from "react-native-toast-message";

//const baseUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
const baseUrl = "https://cd16516fd567.ngrok-free.app/api/";

async function get(url: string) {
  const requestOptions = {
    method: "GET",
    headers: await getHeaders(),
  };

  const response = await fetch(baseUrl + url, requestOptions);
  return handleResponse(response);
}

async function put(url: string, body: unknown) {
  const requestOptions = {
    method: "PUT",
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

async function handleResponse(response: Response): Promise<any> {
  const text = await response.text();
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
            })
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
  const { accessToken } = useAuthStore.getState(); // Use getState() for non-component usage
  //const session = await auth();
  const headers = new Headers();
  headers.set("Content-type", "application/json");
  // console.log("get headers accessToken:", accessToken);
  if (accessToken) {
    headers.set("Authorization", "Bearer " + accessToken);
  }
  return headers;
}

export const fetchWrapper = {
  get,
  post,
  put,
  del,
};
