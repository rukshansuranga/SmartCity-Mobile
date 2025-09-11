import { fetchWrapper } from "@/lib/fetchWrapper";
import { ApiResponse, Notification } from "@/types";

export async function readNotification(
  notificationId: number
): Promise<ApiResponse<void>> {
  console.log("Reading notification:", notificationId);
  return fetchWrapper.get(`notification/read/${notificationId}`);
}

export async function addRating(rating: {
  complainId: number;
  rating: number;
  note: string;
  clientId: string;
  notificationId: number;
}): Promise<ApiResponse<void>> {
  return fetchWrapper.post("notification/rating", rating);
}

export async function getNotifications(
  clientId: number
): Promise<ApiResponse<Notification[]>> {
  return fetchWrapper.get(`notification/client/${clientId}`);
}

export async function getUnreadNotificationCount(
  clientId: number
): Promise<ApiResponse<number>> {
  return fetchWrapper.get(`notification/unread/count/${clientId}`);
}
