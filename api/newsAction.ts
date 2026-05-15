import { fetchWrapper } from "@/lib/fetchWrapper";
import {
  ApiResponse,
  DeviceTokenRequest,
  NewsDetail,
  NewsItem,
  PagedResponse,
} from "@/types";

/**
 * Get news feed for resident
 */
export async function getNewsFeed(
  residentId: string,
  pageIndex = 1,
  pageSize = 20,
): Promise<ApiResponse<PagedResponse<NewsItem>>> {
  console.log(
    `Fetching news feed for resident ${residentId}, page ${pageIndex}`,
  );
  return fetchWrapper.get(
    `resident/${residentId}/news?pageIndex=${pageIndex}&pageSize=${pageSize}`,
  );
}

/**
 * Get news detail (auto-marks as read on backend)
 */
export async function getNewsDetail(
  residentId: string,
  newsId: number,
): Promise<ApiResponse<NewsDetail>> {
  console.log(`Fetching news detail: ${newsId} for resident ${residentId}`);
  return fetchWrapper.get(`resident/${residentId}/news/${newsId}`);
}

/**
 * Mark news as read
 */
export async function markNewsAsRead(
  residentId: string,
  newsId: number,
): Promise<ApiResponse<void>> {
  console.log(`Marking news ${newsId} as read for resident ${residentId}`);
  return fetchWrapper.post(`resident/${residentId}/news/${newsId}/read`, {});
}

/**
 * Get unread news count
 */
export async function getUnreadNewsCount(
  residentId: string,
): Promise<ApiResponse<number>> {
  console.log(`Fetching unread news count for resident ${residentId}`);
  return fetchWrapper.get(`resident/${residentId}/news/unread-count`);
}

/**
 * Register device token for push notifications
 */
export async function registerDeviceToken(
  residentId: string,
  deviceToken: string,
  platform: "iOS" | "Android",
): Promise<ApiResponse<void>> {
  console.log(
    `Registering device token for resident ${residentId}, platform: ${platform}`,
  );
  const body: DeviceTokenRequest = {
    deviceToken,
    platform,
  };
  return fetchWrapper.post(`resident/${residentId}/device-token`, body);
}

/**
 * Remove device token
 */
export async function removeDeviceToken(
  residentId: string,
  deviceToken: string,
): Promise<ApiResponse<void>> {
  console.log(
    `Removing device token for resident ${residentId}: ${deviceToken}`,
  );
  return fetchWrapper.del(
    `resident/${residentId}/device-token/${encodeURIComponent(deviceToken)}`,
  );
}
