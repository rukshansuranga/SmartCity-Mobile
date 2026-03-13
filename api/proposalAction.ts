import { fetchWrapper } from "@/lib/fetchWrapper";
import { ApiResponse } from "@/types";
import {
  MyProposal,
  MyVoteHistory,
  ProposalDetail,
  ProposalFeed,
  ProposalResponse,
  ProposalStatistics,
  ProposalStatus,
  ProposalSubmission,
  VoteRequest,
  VoteResponse,
} from "@/types/proposal";

/**
 * Get proposals for voting (Proposal Hub - Screen B)
 */
export async function getProposals(params?: {
  categoryId?: number;
  status?: string;
  page?: number;
  pageSize?: number;
  sortBy?: "recent" | "top" | "votes";
}): Promise<ApiResponse<ProposalFeed>> {
  const queryParams = new URLSearchParams();
  if (params?.categoryId)
    queryParams.append("categoryId", params.categoryId.toString());
  if (params?.status) queryParams.append("status", params.status);
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.pageSize)
    queryParams.append("pageSize", params.pageSize.toString());
  if (params?.sortBy) queryParams.append("sortBy", params.sortBy);

  const query = queryParams.toString();
  return fetchWrapper.get(`proposal${query ? `?${query}` : ""}`);
}

/**
 * Get proposal details
 */
export async function getProposalDetail(
  proposalId: number,
): Promise<ApiResponse<ProposalDetail>> {
  return fetchWrapper.get(`proposal/${proposalId}`);
}

/**
 * Submit a new proposal (Proposal Wizard - Screen B)
 */
export async function submitProposal(
  proposal: ProposalSubmission,
): Promise<ApiResponse<ProposalResponse>> {
  return fetchWrapper.post(`proposal`, proposal);
}

/**
 * Vote on a proposal (Voting Feed - Screen B)
 */
export async function voteOnProposal(
  proposalId: number,
  vote: VoteRequest,
): Promise<ApiResponse<VoteResponse>> {
  console.log("vote....2", proposalId, vote);

  // Convert VoteType string to integer for backend
  // 1: Support/Upvote, -1: Oppose/Downvote
  const votePayload = {
    voteType: vote.voteType === "Upvote" ? 1 : -1,
    comment: vote.comment,
  };

  return fetchWrapper.post(`proposal/${proposalId}/vote`, votePayload);
}

/**
 * Remove vote from a proposal
 */
export async function removeVote(
  proposalId: number,
): Promise<ApiResponse<void>> {
  return fetchWrapper.del(`proposal/${proposalId}/vote`);
}

/**
 * Get resident's own proposals (My Impact - Screen C)
 */
export async function getMyProposals(): Promise<ApiResponse<MyProposal[]>> {
  return fetchWrapper.get(`proposal/my-proposals`);
}

/**
 * Get resident's voting history (My Impact - Screen C)
 */
export async function getMyVotes(): Promise<ApiResponse<MyVoteHistory[]>> {
  return fetchWrapper.get(`proposal/my-votes`);
}

/**
 * Get proposal status timeline (My Impact - Screen C)
 */
export async function getProposalStatusHistory(
  proposalId: number,
): Promise<ApiResponse<ProposalStatus[]>> {
  return fetchWrapper.get(`proposal/${proposalId}/status-history`);
}

/**
 * Get proposal statistics for category
 */
export async function getProposalStatistics(
  categoryId?: number,
): Promise<ApiResponse<ProposalStatistics>> {
  const query = categoryId ? `?categoryId=${categoryId}` : "";
  return fetchWrapper.get(`proposal/statistics${query}`);
}
