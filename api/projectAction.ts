import { fetchWrapper } from "@/lib/fetchWrapper";
import { ApiResponse, Project, ProjectProgress } from "@/types";
import { ProjectStatus, ProjectType } from "../enums/enum";

export async function filterProjects(
  request: projectFilterRequest
): Promise<ApiResponse<Project[]>> {
  return fetchWrapper.post("project/filter", request);
}

type projectFilterRequest = {
  type: ProjectType;
  status: ProjectStatus;
  subject: string | null;
  city: string | null;
  isRecent: boolean | null;
};

export async function getRecentProjects(
  type: ProjectType
): Promise<ApiResponse<Project[]>> {
  return fetchWrapper.get(`project/recent?type=${type}`);
}

export async function getProjectDetails(
  id: string
): Promise<ApiResponse<Project>> {
  return fetchWrapper.get(`project/${id}`);
}

export async function GetProjectProgressByProjectIdAsync(
  projectId: string
): Promise<ApiResponse<ProjectProgress[]>> {
  return fetchWrapper.get(`project/${projectId}/progress`);
}
