import { fetchWrapper } from "@/lib/fetchWrapper";
import { ApiResponse } from "@/types";
import {
  AssetCounts,
  AssetStatus,
  AssetType,
  CreateInfrastructureComplaintDto,
  InfrastructureAsset,
  InfrastructureComplaint,
} from "@/types/infrastructure";

// Infrastructure Asset API Actions

/**
 * GET Assets by Bounds
 * Endpoint: GET /api/Infrastructure/bounds?minLat&maxLat&minLng&maxLng&assetType
 * Purpose: Retrieves assets within specified map bounds (efficient loading)
 */
export async function getAssetsByBounds(params: {
  minLat: number;
  minLng: number;
  maxLat: number;
  maxLng: number;
  assetType?: AssetType;
}): Promise<ApiResponse<InfrastructureAsset[]>> {
  const queryParams = new URLSearchParams({
    minLat: params.minLat.toString(),
    minLng: params.minLng.toString(),
    maxLat: params.maxLat.toString(),
    maxLng: params.maxLng.toString(),
  });

  if (params.assetType !== undefined) {
    queryParams.append("assetType", params.assetType.toString());
  }

  return fetchWrapper.get(`Infrastructure/bounds?${queryParams.toString()}`);
}

/**
 * GET Assets by Council
 * Endpoint: GET /api/Infrastructure?assetType&status
 * Purpose: Retrieves all assets for the council, optionally filtered
 */
export async function getAssetsByCouncil(params?: {
  assetType?: AssetType;
  status?: AssetStatus;
}): Promise<ApiResponse<InfrastructureAsset[]>> {
  if (!params) {
    return fetchWrapper.get("Infrastructure");
  }

  const queryParams = new URLSearchParams();
  if (params.assetType !== undefined) {
    queryParams.append("assetType", params.assetType.toString());
  }
  if (params.status !== undefined) {
    queryParams.append("status", params.status.toString());
  }

  const query = queryParams.toString();
  return fetchWrapper.get(`Infrastructure${query ? `?${query}` : ""}`);
}

/**
 * GET Asset by ID
 * Endpoint: GET /api/Infrastructure/{assetId}
 * Purpose: Retrieves detailed information about a specific asset
 */
export async function getAssetById(
  assetId: string,
): Promise<ApiResponse<InfrastructureAsset>> {
  return fetchWrapper.get(`Infrastructure/${assetId}`);
}

/**
 * GET Asset Counts
 * Endpoint: GET /api/Infrastructure/counts
 * Purpose: Retrieves count of assets by type for the council
 */
export async function getAssetCounts(): Promise<ApiResponse<AssetCounts>> {
  return fetchWrapper.get("Infrastructure/counts");
}

// Infrastructure Complaint API Actions

/**
 * POST Create Infrastructure Complaint
 * Endpoint: POST /api/Complain/infrastructure
 * Purpose: Creates a new complaint for an infrastructure asset
 */
export async function addInfrastructureComplaint(
  complaint: CreateInfrastructureComplaintDto,
): Promise<ApiResponse<InfrastructureComplaint>> {
  return fetchWrapper.post("Complain/infrastructure", complaint);
}

/**
 * GET Complaints by Asset
 * Endpoint: GET /api/Complain/infrastructure/asset/{assetId}
 * Purpose: Retrieves all complaints for a specific asset
 */
export async function getComplaintsByAsset(
  assetId: string,
): Promise<ApiResponse<InfrastructureComplaint[]>> {
  return fetchWrapper.get(`Complain/infrastructure/asset/${assetId}`);
}

/**
 * GET Complaint by ID
 * Endpoint: GET /api/Complain/infrastructure/{complainId}
 * Purpose: Retrieves details of a specific infrastructure complaint
 */
export async function getInfrastructureComplaintById(
  complainId: number,
): Promise<ApiResponse<InfrastructureComplaint>> {
  return fetchWrapper.get(`Complain/infrastructure/${complainId}`);
}

/**
 * GET My Infrastructure Complaints
 * Endpoint: GET /api/Complain/infrastructure/mine
 * Purpose: Retrieves all infrastructure complaints created by the current user
 */
export async function getMyInfrastructureComplaints(): Promise<
  ApiResponse<InfrastructureComplaint[]>
> {
  return fetchWrapper.get("Complain/infrastructure/mine");
}

/**
 * UPDATE Infrastructure Complaint
 * Endpoint: PUT /api/Complain/infrastructure/{complainId}
 * Purpose: Updates an existing infrastructure complaint
 */
export async function updateInfrastructureComplaint(
  complainId: number,
  complaint: Partial<CreateInfrastructureComplaintDto>,
): Promise<ApiResponse<InfrastructureComplaint>> {
  return fetchWrapper.put(`Complain/infrastructure/${complainId}`, complaint);
}

/**
 * DELETE Infrastructure Complaint
 * Endpoint: DELETE /api/Complain/infrastructure/{complainId}
 * Purpose: Soft deletes an infrastructure complaint
 */
export async function deleteInfrastructureComplaint(
  complainId: number,
): Promise<ApiResponse<void>> {
  return fetchWrapper.del(`Complain/infrastructure/${complainId}`);
}
