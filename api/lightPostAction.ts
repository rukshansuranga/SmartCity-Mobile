import { fetchWrapper } from "@/lib/fetchWrapper";
import { ApiResponse } from "@/types";
import { Place } from "react-native-google-places-textinput";

export async function getNearLightPosts(
  place: Place
): Promise<ApiResponse<any[]>> {
  return fetchWrapper.get(
    `complain/lightPost/near?latitude=${place.details?.location?.latitude}&longitude=${place.details?.location?.longitude}`
  );
}

export async function addLightPostComplainAsync(complain: {
  lightPostNumber: string;
  clientId: string;
  subject: string;
  detail: string;
}): Promise<ApiResponse<void>> {
  return fetchWrapper.post("complain/lightPost", complain);
}

export async function getListPostsByPostNo(
  postNo: string
): Promise<ApiResponse<any[]>> {
  return fetchWrapper.get(`complain/lightPost/${postNo}`);
}

export async function getListPostsSpecificCategoryByPostNoAndName(
  postNo: string,
  name: string
): Promise<ApiResponse<any[]>> {
  return fetchWrapper.get(`complain/lightPost/${postNo}/${name}`);
}

export async function GetActiveListPostComplainsByMe(
  postNo: string
): Promise<ApiResponse<any[]>> {
  return fetchWrapper.get(`complain/lightPost/me/${postNo}`);
}
