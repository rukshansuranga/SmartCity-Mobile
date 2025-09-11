import { fetchWrapper } from "@/lib/fetchWrapper";
import { ApiResponse, Client } from "@/types";

export async function postClient(client: Client): Promise<ApiResponse<Client>> {
  console.log("Posting client:", client);
  return fetchWrapper.post("client", client);
}
