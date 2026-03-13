/**
 * Proposal Management Types
 * Based on the Resident Budget Management Mobile Application design
 */

export type ProposalStatusType =
  | "Submitted"
  | "UnderReview"
  | "Approved"
  | "Rejected"
  | "Funded"
  | "Implemented";

export type VoteType = "Upvote" | "Downvote";

// Proposal Feed (Screen B - Proposal Hub)
export interface ProposalFeed {
  proposals: ProposalCard[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ProposalCard {
  proposalId: number;
  title: string;
  description: string;
  estimatedCost: number;
  categoryId: number;
  categoryName: string;
  categoryCode?: string;
  residentId: string;
  residentName: string;
  status: ProposalStatusType;
  submittedAt: string;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  userVote?: VoteType; // Current user's vote (if any)
}

// Proposal Detail
export interface ProposalDetail extends ProposalCard {
  councilId: string;
  detailedDescription?: string;
  attachments?: string[];
  statusHistory: ProposalStatus[];
  topComments?: ProposalComment[];
}

export interface ProposalComment {
  commentId: number;
  text: string;
  residentName: string;
  createdAt: string;
}

// Proposal Submission (Wizard - Screen B)
export interface ProposalSubmission {
  categoryId: number;
  title: string;
  description: string;
  estimatedCost: number;
}

export interface ProposalResponse {
  proposalId: number;
  title: string;
  status: ProposalStatusType;
  submittedAt: string;
  message: string;
}

// Voting
export interface VoteRequest {
  voteType: VoteType;
  comment?: string;
}

export interface VoteResponse {
  proposalVoteId: number;
  proposalId: number;
  voteType: VoteType;
  upvotes: number;
  downvotes: number;
  netVotes: number; // upvotes - downvotes
}

// My Proposals (Screen C - My Impact)
export interface MyProposal {
  proposalId: number;
  title: string;
  description: string;
  categoryName: string;
  estimatedCost: number;
  status: ProposalStatusType;
  submittedAt: string;
  upvotes: number;
  downvotes: number;
  netVotes: number;
  lastStatusUpdate?: string;
  statusTimeline: ProposalStatus[];
}

// My Voting History (Screen C - My Impact)
export interface MyVoteHistory {
  proposalVoteId: number;
  proposalId: number;
  proposalTitle: string;
  categoryName: string;
  voteType: VoteType;
  votedAt: string;
  comment?: string;
}

// Proposal Status Timeline
export interface ProposalStatus {
  statusLogId: number;
  proposalId: number;
  status: ProposalStatusType;
  notes?: string;
  changedBy?: string;
  changedAt: string;
}

// Proposal Statistics
export interface ProposalStatistics {
  totalProposals: number;
  submittedCount: number;
  underReviewCount: number;
  approvedCount: number;
  rejectedCount: number;
  totalVotes: number;
  uniqueVoters: number;
  categoryBreakdown: CategoryProposalStats[];
}

export interface CategoryProposalStats {
  categoryId: number;
  categoryName: string;
  proposalCount: number;
  totalEstimatedCost: number;
}
