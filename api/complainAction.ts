import { fetchWrapper } from "@/lib/fetchWrapper";
import { ApiResponse, GeneralComplain, ProjectComplain } from "@/types";

// Types for Project Complain requests
export interface ProjectComplainPostRequest {
  subject: string;
  detail?: string;
  projectId: string;
  clientId?: string;
}

export interface ProjectComplainUpdateRequest {
  subject?: string;
  detail?: string;
  status?: number;
}

// General Complain Actions
export async function addGeneralComplain(
  complain: Partial<GeneralComplain>
): Promise<ApiResponse<GeneralComplain>> {
  return fetchWrapper.post("complain/general", complain);
}

export async function GetGeneralComplainPaging(
  page,
  isPrivate,
  pageSize = 10
): Promise<ApiResponse<GeneralComplain[]>> {
  return fetchWrapper.get(
    `complain/general?pageNumber=${page}&isPrivate=${isPrivate}&pageSize=${pageSize}`
  );
}

export async function deleteGeneralComplain(
  complainId: number
): Promise<ApiResponse<void>> {
  return fetchWrapper.del(`complain/general/${complainId}`);
}

// Project Complain Actions

/**
 * GET Project Complains by Project ID
 * Endpoint: GET /api/complain/projectcomplains/{projectId}
 * Purpose: Retrieves all complains for a specific project
 */
export async function getProjectComplainsByProjectId(
  projectId: number
): Promise<ApiResponse<ProjectComplain[]>> {
  return fetchWrapper.get(`complain/projectcomplains/${projectId}`);
}

/**
 * POST Add Project Complain
 * Endpoint: POST /api/complain/projectcomplain
 * Purpose: Creates a new project complain
 */
export async function addProjectComplain(
  complain: ProjectComplainPostRequest
): Promise<ApiResponse<ProjectComplain>> {
  return fetchWrapper.post("complain/projectcomplain", complain);
}

/**
 * PUT Update Project Complain
 * Endpoint: PUT /api/complain/projectcomplain/{complainId}
 * Purpose: Updates an existing project complain
 */
export async function updateProjectComplain(
  complainId: number,
  complain: ProjectComplainUpdateRequest
): Promise<ApiResponse<ProjectComplain>> {
  return fetchWrapper.put(`complain/projectcomplain/${complainId}`, complain);
}

/**
 * GET Project Complain by ID
 * Endpoint: GET /api/complain/projectcomplain/{ComplainId}
 * Purpose: Retrieves a specific project complain by its ID
 */
export async function getProjectComplainById(
  complainId: number
): Promise<ApiResponse<ProjectComplain>> {
  return fetchWrapper.get(`complain/projectcomplain/${complainId}`);
}

/**
 * DELETE Project Complain
 * Endpoint: DELETE /api/complain/projectcomplain/{complainId}
 * Purpose: Soft deletes a project complain (sets IsActive = false)
 */
export async function deleteProjectComplain(
  complainId: number
): Promise<ApiResponse<void>> {
  return fetchWrapper.del(`complain/projectcomplain/${complainId}`);
}
