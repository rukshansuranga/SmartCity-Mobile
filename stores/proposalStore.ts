import {
  getMyProposals,
  getMyVotes,
  getProposalDetail,
  getProposals,
  getProposalStatistics,
  removeVote,
  submitProposal,
  voteOnProposal,
} from "@/api/proposalAction";
import {
  MyProposal,
  MyVoteHistory,
  ProposalDetail,
  ProposalFeed,
  ProposalStatistics,
  ProposalSubmission,
  VoteType,
} from "@/types/proposal";
import { create } from "zustand";

interface ProposalState {
  // Data
  proposals: ProposalFeed | null;
  selectedProposal: ProposalDetail | null;
  myProposals: MyProposal[];
  myVotes: MyVoteHistory[];
  statistics: ProposalStatistics | null;

  // Loading states
  isLoadingProposals: boolean;
  isLoadingProposalDetail: boolean;
  isLoadingMyProposals: boolean;
  isLoadingMyVotes: boolean;
  isSubmitting: boolean;
  isVoting: boolean;

  // Error states
  error: string | null;

  // Actions
  fetchProposals: (filters?: {
    categoryId?: number;
    status?: string;
    page?: number;
    sortBy?: "recent" | "top" | "votes";
  }) => Promise<void>;
  fetchProposalDetail: (proposalId: number) => Promise<void>;
  submitNewProposal: (proposal: ProposalSubmission) => Promise<boolean>;
  vote: (proposalId: number, voteType: VoteType) => Promise<void>;
  removeMyVote: (proposalId: number) => Promise<void>;
  fetchMyProposals: () => Promise<void>;
  fetchMyVotes: () => Promise<void>;
  fetchStatistics: (categoryId?: number) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export const useProposalStore = create<ProposalState>((set, get) => ({
  // Initial state
  proposals: null,
  selectedProposal: null,
  myProposals: [],
  myVotes: [],
  statistics: null,

  isLoadingProposals: false,
  isLoadingProposalDetail: false,
  isLoadingMyProposals: false,
  isLoadingMyVotes: false,
  isSubmitting: false,
  isVoting: false,

  error: null,

  // Fetch proposals for voting feed
  fetchProposals: async (filters) => {
    set({ isLoadingProposals: true, error: null });
    try {
      const response = await getProposals(filters);
      if (response.isSuccess) {
        set({ proposals: response.data, isLoadingProposals: false });
      } else {
        set({ error: response.message, isLoadingProposals: false });
      }
    } catch (error: any) {
      set({
        error: error.message || "Failed to load proposals",
        isLoadingProposals: false,
      });
    }
  },

  // Fetch proposal detail
  fetchProposalDetail: async (proposalId: number) => {
    set({ isLoadingProposalDetail: true, error: null });
    try {
      const response = await getProposalDetail(proposalId);
      if (response.isSuccess) {
        set({
          selectedProposal: response.data,
          isLoadingProposalDetail: false,
        });
      } else {
        set({ error: response.message, isLoadingProposalDetail: false });
      }
    } catch (error: any) {
      set({
        error: error.message || "Failed to load proposal details",
        isLoadingProposalDetail: false,
      });
    }
  },

  // Submit a new proposal
  submitNewProposal: async (proposal: ProposalSubmission) => {
    set({ isSubmitting: true, error: null });
    try {
      const response = await submitProposal(proposal);
      if (response.isSuccess) {
        set({ isSubmitting: false });
        // Refresh proposals list
        get().fetchProposals();
        return true;
      } else {
        set({ error: response.message, isSubmitting: false });
        return false;
      }
    } catch (error: any) {
      set({
        error: error.message || "Failed to submit proposal",
        isSubmitting: false,
      });
      return false;
    }
  },

  // Vote on a proposal
  vote: async (proposalId: number, voteType: VoteType) => {
    set({ isVoting: true, error: null });
    try {
      const response = await voteOnProposal(proposalId, {
        voteType,
      });
      if (response.isSuccess) {
        set({ isVoting: false });
        // Update the proposal in the list
        const proposals = get().proposals;
        if (proposals) {
          const updatedProposals = proposals.proposals.map((p) =>
            p.proposalId === proposalId
              ? {
                  ...p,
                  upvoteCount: response.data.newUpvoteCount,
                  downvoteCount: response.data.newDownvoteCount,
                  userVoteType: voteType === "Upvote" ? 1 : -1,
                  userVoteName: voteType,
                }
              : p,
          );
          set({
            proposals: {
              ...proposals,
              proposals: updatedProposals,
            },
          });
        }
      } else {
        set({ error: response.message, isVoting: false });
      }
    } catch (error: any) {
      set({
        error: error.message || "Failed to vote",
        isVoting: false,
      });
    }
  },

  // Remove vote
  removeMyVote: async (proposalId: number) => {
    set({ isVoting: true, error: null });
    try {
      const response = await removeVote(proposalId);
      if (response.isSuccess) {
        set({ isVoting: false });
        // Update the proposal in the list
        const proposals = get().proposals;
        if (proposals) {
          const updatedProposals = proposals.proposals.map((p) => {
            if (p.proposalId === proposalId) {
              // Decrement the appropriate count based on previous vote
              const updatedProposal = { ...p };
              if (p.userVoteType === 1) {
                updatedProposal.upvoteCount = Math.max(
                  0,
                  (p.upvoteCount || 0) - 1,
                );
              } else if (p.userVoteType === -1) {
                updatedProposal.downvoteCount = Math.max(
                  0,
                  (p.downvoteCount || 0) - 1,
                );
              }
              // Clear user vote
              updatedProposal.userVoteType = undefined;
              updatedProposal.userVoteName = undefined;
              updatedProposal.userVoteComment = undefined;
              return updatedProposal;
            }
            return p;
          });
          set({
            proposals: {
              ...proposals,
              proposals: updatedProposals,
            },
          });
        }
      } else {
        set({ error: response.message, isVoting: false });
      }
    } catch (error: any) {
      set({
        error: error.message || "Failed to remove vote",
        isVoting: false,
      });
    }
  },

  // Fetch user's proposals
  fetchMyProposals: async () => {
    set({ isLoadingMyProposals: true, error: null });
    try {
      const response = await getMyProposals();
      if (response.isSuccess) {
        set({ myProposals: response.data, isLoadingMyProposals: false });
      } else {
        set({ error: response.message, isLoadingMyProposals: false });
      }
    } catch (error: any) {
      set({
        error: error.message || "Failed to load my proposals",
        isLoadingMyProposals: false,
      });
    }
  },

  // Fetch user's voting history
  fetchMyVotes: async () => {
    set({ isLoadingMyVotes: true, error: null });
    try {
      const response = await getMyVotes();
      if (response.isSuccess) {
        set({ myVotes: response.data, isLoadingMyVotes: false });
      } else {
        set({ error: response.message, isLoadingMyVotes: false });
      }
    } catch (error: any) {
      set({
        error: error.message || "Failed to load voting history",
        isLoadingMyVotes: false,
      });
    }
  },

  // Fetch statistics
  fetchStatistics: async (categoryId?: number) => {
    try {
      const response = await getProposalStatistics(categoryId);
      if (response.isSuccess) {
        set({ statistics: response.data });
      } else {
        set({ error: response.message });
      }
    } catch (error: any) {
      set({ error: error.message || "Failed to load statistics" });
    }
  },

  clearError: () => set({ error: null }),

  reset: () =>
    set({
      proposals: null,
      selectedProposal: null,
      myProposals: [],
      myVotes: [],
      statistics: null,
      error: null,
    }),
}));
