import { getDraftBudget } from "@/api/budgetAction";
import { DeadlineCountdown } from "@/components/proposals/DeadlineCountdown";
import { ProposalCard } from "@/components/proposals/ProposalCard";
import { BudgetColors } from "@/constants/budgetColors";
import { useAuthStore } from "@/stores/authStore";
import { useProposalStore } from "@/stores/proposalStore";
import { DraftBudgetOverview } from "@/types/budget";
import { VoteType } from "@/types/proposal";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProposalHubScreen() {
  const router = useRouter();
  const selectedCouncil = useAuthStore((state) => state.selectedCouncil);
  const {
    proposals,
    isLoadingProposals,
    error,
    fetchProposals,
    vote,
    removeMyVote,
    clearError,
  } = useProposalStore();

  const [draftBudget, setDraftBudget] = useState<DraftBudgetOverview | null>(
    null,
  );
  const [sortBy, setSortBy] = useState<"recent" | "top" | "votes">("recent");
  const [selectedCategory, setSelectedCategory] = useState<
    number | undefined
  >();

  useEffect(() => {
    loadData();
  }, [sortBy, selectedCategory]);

  const loadData = async () => {
    // Load draft budget info
    try {
      const response = await getDraftBudget();
      if (response.isSuccess) {
        setDraftBudget(response.data);
      }
    } catch (err) {
      console.error("Failed to load draft budget", err);
    }

    // Load proposals
    fetchProposals({ sortBy, categoryId: selectedCategory });
  };

  const handleRefresh = () => {
    clearError();
    loadData();
  };

  const handleVote = async (proposalId: number, voteType: VoteType) => {
    const proposal = proposals?.proposals.find(
      (p) => p.proposalId === proposalId,
    );

    if (proposal?.userVoteName === voteType) {
      // Remove vote if clicking the same button
      await removeMyVote(proposalId);
    } else {
      await vote(proposalId, voteType);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={isLoadingProposals}
            onRefresh={handleRefresh}
            colors={[BudgetColors.primary.green]}
          />
        }
      >
        {/* Deadline Banner */}
        {draftBudget &&
          draftBudget.proposalDeadline &&
          draftBudget.daysLeftToSubmit !== null && (
            <DeadlineCountdown
              daysLeft={draftBudget.daysLeftToSubmit}
              deadline={draftBudget.proposalDeadline}
              isOpen={draftBudget.isSubmissionOpen}
            />
          )}

        {/* Submit Button */}
        {draftBudget?.isSubmissionOpen && (
          <TouchableOpacity
            onPress={() => router.push("/(budget)/proposals/wizard")}
            className="mx-4 mt-4 rounded-xl p-4 shadow-lg flex-row items-center justify-center"
            style={{ backgroundColor: BudgetColors.primary.green }}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="lightbulb" size={24} color="white" />
            <Text className="text-white font-bold text-lg ml-2">
              Submit Your Idea
            </Text>
          </TouchableOpacity>
        )}

        {error && (
          <View className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
            <Text className="text-red-800">{error}</Text>
          </View>
        )}

        {/* Filters */}
        <View className="px-4 mt-6">
          <View className="flex-row items-center mb-3">
            <Text className="text-sm font-semibold text-gray-700 mr-3">
              Sort by:
            </Text>
            <View className="flex-row gap-2">
              {["recent", "top", "votes"].map((option) => (
                <TouchableOpacity
                  key={option}
                  onPress={() => setSortBy(option as any)}
                  className="px-4 py-2 rounded-full"
                  style={{
                    backgroundColor:
                      sortBy === option
                        ? BudgetColors.primary.green
                        : "#F1F5F9",
                  }}
                >
                  <Text
                    className="text-sm font-semibold capitalize"
                    style={{
                      color: sortBy === option ? "white" : "#64748B",
                    }}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Category Filter */}
          {draftBudget?.categories && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-4"
            >
              <TouchableOpacity
                onPress={() => setSelectedCategory(undefined)}
                className="px-4 py-2 rounded-full mr-2"
                style={{
                  backgroundColor: !selectedCategory
                    ? BudgetColors.primary.green
                    : "#F1F5F9",
                }}
              >
                <Text
                  className="text-sm font-semibold"
                  style={{
                    color: !selectedCategory ? "white" : "#64748B",
                  }}
                >
                  All
                </Text>
              </TouchableOpacity>
              {draftBudget.categories.map((cat) => (
                <TouchableOpacity
                  key={cat.categoryId}
                  onPress={() => setSelectedCategory(cat.categoryId)}
                  className="px-4 py-2 rounded-full mr-2"
                  style={{
                    backgroundColor:
                      selectedCategory === cat.categoryId
                        ? BudgetColors.primary.green
                        : "#F1F5F9",
                  }}
                >
                  <Text
                    className="text-sm font-semibold"
                    style={{
                      color:
                        selectedCategory === cat.categoryId
                          ? "white"
                          : "#64748B",
                    }}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Proposals List */}
        <View className="px-4 mb-6">
          <Text className="text-xl font-bold text-gray-800 mb-4">
            Community Ideas
          </Text>

          {proposals && proposals.proposals.length > 0 ? (
            proposals.proposals.map((proposal) => (
              <ProposalCard
                key={proposal.proposalId}
                proposal={proposal}
                onPress={() =>
                  router.push(`/(budget)/proposals/${proposal.proposalId}`)
                }
                onVote={(voteType) => handleVote(proposal.proposalId, voteType)}
              />
            ))
          ) : (
            <View className="items-center py-8">
              <MaterialCommunityIcons
                name="lightbulb-off-outline"
                size={60}
                color="#CBD5E1"
              />
              <Text className="text-gray-400 mt-4 text-center">
                No proposals yet. Be the first to share an idea!
              </Text>
            </View>
          )}

          {/* Pagination Info */}
          {proposals && proposals.totalPages > 1 && (
            <View className="mt-4 items-center">
              <Text className="text-sm text-gray-600">
                Page {proposals.page} of {proposals.totalPages}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View className="flex-row bg-white border-t border-gray-200">
        <TouchableOpacity
          className="flex-1 items-center py-3"
          onPress={() => router.push("/(budget)")}
        >
          <MaterialCommunityIcons
            name="wallet-outline"
            size={24}
            color="#94A3B8"
          />
          <Text className="text-xs text-gray-500 mt-1">Budget</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 items-center py-3"
          style={{ backgroundColor: BudgetColors.primary.green + "10" }}
          onPress={() => router.push("/(budget)/proposals")}
        >
          <MaterialCommunityIcons
            name="lightbulb"
            size={24}
            color={BudgetColors.primary.green}
          />
          <Text
            className="text-xs font-semibold mt-1"
            style={{ color: BudgetColors.primary.green }}
          >
            Ideas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 items-center py-3"
          onPress={() => router.push("/(budget)/impact")}
        >
          <MaterialCommunityIcons name="chart-line" size={24} color="#94A3B8" />
          <Text className="text-xs text-gray-500 mt-1">My Impact</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
