import { fetchWrapper } from "@/lib/fetchWrapper";
import { ApiResponse } from "@/types";

export interface CouncilDetails {
  councilName: string;
  councilId: string;
  city: string;
  latitude: number;
  longitude: number;
}

export async function getCouncilByName(
  councilName: string,
): Promise<ApiResponse<CouncilDetails>> {
  console.log("Fetching council details for:", councilName);
  return fetchWrapper.get(`misc/council/${councilName}`);
}
