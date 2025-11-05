import { fetchWrapper } from "@/lib/fetchWrapper";
import { ApiResponse, Resident } from "@/types";

export async function postResident(resident: Resident): Promise<ApiResponse<Resident>> {
  console.log("Posting resident:", resident);
  return fetchWrapper.post("resident", resident);
}
