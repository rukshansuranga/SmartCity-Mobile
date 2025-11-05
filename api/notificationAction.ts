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
  residentId: string;
  notificationId: number;
}): Promise<ApiResponse<void>> {
  return fetchWrapper.post("notification/rating", rating);
}

export async function getNotifications(
  residentId: string | number
): Promise<ApiResponse<Notification[]>> {
  return fetchWrapper.get(`notification/resident/${residentId}`);
}

export async function getUnreadNotificationCount(
  residentId: string | number
): Promise<ApiResponse<number>> {
  return fetchWrapper.get(`notification/unread/count/${residentId}`);
}
