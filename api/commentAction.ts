import { fetchWrapper } from "@/lib/fetchWrapper";
import { ApiResponse, Comment, EntityType } from "@/types";

export async function addComment(
  comment: Partial<Comment>
): Promise<ApiResponse<Comment>> {
  return fetchWrapper.post("comment", comment);
}

export async function getCommentById(
  id: number
): Promise<ApiResponse<Comment>> {
  return fetchWrapper.get(`comment/${id}`);
}

export async function getCommentsByEntity(
  entityType: EntityType,
  entityId: string
): Promise<ApiResponse<Comment[]>> {
  return fetchWrapper.post("comment/entity", { entityType, entityId });
}

export async function updateComment(
  id: number,
  comment: Partial<Comment>
): Promise<ApiResponse<Comment>> {
  return fetchWrapper.put(`comment/${id}`, comment);
}

export async function deleteComment(id: number): Promise<ApiResponse<void>> {
  return fetchWrapper.del(`comment/${id}`);
}
