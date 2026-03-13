import { fetchWrapper } from "@/lib/fetchWrapper";
import { ApiResponse, Project, ProjectProgress } from "@/types";
import { ProjectStatus, ProjectType } from "../enums/enum";

export async function filterProjects(
  request: projectFilterRequest,
): Promise<ApiResponse<Project[]>> {
  return fetchWrapper.post("project/filter", request);
}

type projectFilterRequest = {
  type: ProjectType;
  status: ProjectStatus;
  name: string | null;
  city: string | null;
  isRecent: boolean;
};

export async function getRecentProjects(
  type: ProjectType,
): Promise<ApiResponse<Project[]>> {
  return fetchWrapper.get(`project/recent?type=${type}`);
}

export async function getProjectDetails(
  id: string,
): Promise<ApiResponse<Project>> {
  return fetchWrapper.get(`project/${id}`);
}

export async function GetProjectProgressByProjectIdAsync(
  projectId: string,
): Promise<ApiResponse<ProjectProgress[]>> {
  return fetchWrapper.get(`project/${projectId}/progress`);
}

export async function getProjectsByCouncilId(
  councilId: string,
): Promise<ApiResponse<Project[]>> {
  return fetchWrapper.get(`project/council/${councilId}`);
}
