import { StatusBadge } from "@/components/budget/StatusBadge";
import { BudgetColors } from "@/constants/budgetColors";
import { useProposalStore } from "@/stores/proposalStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function MyImpactScreen() {
  const router = useRouter();
  const {
    myProposals,
    myVotes,
    isLoadingMyProposals,
    isLoadingMyVotes,
    error,
    fetchMyProposals,
    fetchMyVotes,
    clearError,
  } = useProposalStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    fetchMyProposals();
    fetchMyVotes();
  };

  const handleRefresh = () => {
    clearError();
    loadData();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const totalProposals = myProposals?.length || 0;
  const totalVotes = myVotes?.length || 0;
  const approvedProposals =
    myProposals?.filter((p) => p.status === "Approved" || p.status === "Funded")
      .length || 0;

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={isLoadingMyProposals || isLoadingMyVotes}
            onRefresh={handleRefresh}
            colors={[BudgetColors.primary.green]}
          />
        }
      >
        {error && (
          <View className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
            <Text className="text-red-800">{error}</Text>
          </View>
        )}

        {/* Header Section */}
        <View
          className="px-4 py-6 rounded-b-3xl"
          style={{ backgroundColor: BudgetColors.primary.green }}
        >
          <Text className="text-2xl font-bold text-white mb-4">My Impact</Text>

          {/* Stats Cards */}
          <View className="flex-row gap-3">
            <View className="flex-1 bg-white rounded-xl p-4">
              <Text className="text-3xl font-bold text-gray-800">
                {totalProposals}
              </Text>
              <Text className="text-sm text-gray-600 mt-1">Proposals</Text>
            </View>
            <View className="flex-1 bg-white rounded-xl p-4">
              <Text className="text-3xl font-bold text-gray-800">
                {totalVotes}
              </Text>
              <Text className="text-sm text-gray-600 mt-1">Votes</Text>
            </View>
            <View className="flex-1 bg-white rounded-xl p-4">
              <Text className="text-3xl font-bold text-gray-800">
                {approvedProposals}
              </Text>
              <Text className="text-sm text-gray-600 mt-1">Approved</Text>
            </View>
          </View>
        </View>

        {/* My Proposals Section */}
        <View className="px-4 mt-6">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <MaterialCommunityIcons
                name="lightbulb"
                size={24}
                color={BudgetColors.primary.green}
              />
              <Text className="text-xl font-bold text-gray-800 ml-2">
                My Proposals
              </Text>
            </View>
            {myProposals?.length > 0 && (
              <TouchableOpacity>
                <Text
                  className="text-sm font-semibold"
                  style={{ color: BudgetColors.primary.green }}
                >
                  View All →
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {myProposals?.length > 0 ? (
            myProposals.slice(0, 5).map((proposal) => (
              <View
                key={proposal.proposalId}
                className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
              >
                <View className="flex-row items-start justify-between mb-2">
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-gray-800 mb-1">
                      {proposal.title}
                    </Text>
                    <StatusBadge status={proposal.status} size="sm" />
                  </View>
                </View>

                <View className="flex-row items-center mt-2 mb-3">
                  <MaterialCommunityIcons
                    name="folder-outline"
                    size={16}
                    color="#64748B"
                  />
                  <Text className="text-xs text-gray-600 ml-1 mr-3">
                    {proposal.categoryName}
                  </Text>
                  <MaterialCommunityIcons
                    name="cash"
                    size={16}
                    color="#64748B"
                  />
                  <Text className="text-xs text-gray-600 ml-1">
                    ${proposal.estimatedCost.toLocaleString()}
                  </Text>
                </View>

                {/* Vote Count */}
                <View className="flex-row items-center pt-3 border-t border-gray-100">
                  <View className="flex-row items-center mr-4">
                    <MaterialCommunityIcons
                      name="arrow-up-bold"
                      size={18}
                      color={BudgetColors.vote.upvote}
                    />
                    <Text className="text-sm font-semibold text-gray-700 ml-1">
                      {proposal.upvotes}
                    </Text>
                  </View>
                  <View className="flex-row items-center mr-4">
                    <MaterialCommunityIcons
                      name="arrow-down-bold"
                      size={18}
                      color={BudgetColors.vote.downvote}
                    />
                    <Text className="text-sm font-semibold text-gray-700 ml-1">
                      {proposal.downvotes}
                    </Text>
                  </View>
                  <Text
                    className="text-sm font-bold"
                    style={{
                      color:
                        proposal.netVotes > 0
                          ? BudgetColors.vote.upvote
                          : proposal.netVotes < 0
                            ? BudgetColors.vote.downvote
                            : "#64748B",
                    }}
                  >
                    {proposal.netVotes > 0 ? "+" : ""}
                    {proposal.netVotes} net
                  </Text>
                  <Text className="text-xs text-gray-500 ml-auto">
                    {formatDate(proposal.submittedAt)}
                  </Text>
                </View>

                {/* Status Timeline */}
                {proposal.statusTimeline?.length > 0 && (
                  <View className="mt-3 pt-3 border-t border-gray-100">
                    <Text className="text-xs font-semibold text-gray-700 mb-2">
                      Timeline
                    </Text>
                    {proposal.statusTimeline
                      .slice(0, 3)
                      .map((status, index) => (
                        <View
                          key={status.statusLogId}
                          className="flex-row items-center mb-1"
                        >
                          <View
                            className="w-2 h-2 rounded-full mr-2"
                            style={{
                              backgroundColor:
                                index === 0
                                  ? BudgetColors.primary.green
                                  : "#CBD5E1",
                            }}
                          />
                          <Text className="text-xs text-gray-600 flex-1">
                            {status.status} - {formatDate(status.changedAt)}
                          </Text>
                        </View>
                      ))}
                  </View>
                )}
              </View>
            ))
          ) : (
            <View className="bg-white rounded-xl p-8 items-center">
              <MaterialCommunityIcons
                name="lightbulb-off-outline"
                size={60}
                color="#CBD5E1"
              />
              <Text className="text-gray-400 mt-4 text-center">
                You haven't submitted any proposals yet
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(budget)/proposals/wizard")}
                className="mt-4 px-6 py-3 rounded-full"
                style={{ backgroundColor: BudgetColors.primary.green }}
              >
                <Text className="text-white font-semibold">
                  Submit Your First Idea
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* My Voting History */}
        <View className="px-4 mt-6 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <MaterialCommunityIcons
                name="vote"
                size={24}
                color={BudgetColors.primary.green}
              />
              <Text className="text-xl font-bold text-gray-800 ml-2">
                My Votes
              </Text>
            </View>
            {myVotes?.length > 0 && (
              <TouchableOpacity>
                <Text
                  className="text-sm font-semibold"
                  style={{ color: BudgetColors.primary.green }}
                >
                  View All →
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {myVotes?.length > 0 ? (
            myVotes.slice(0, 10).map((vote) => {
              // Handle both numeric (1, -1) and string ("Upvote", "Downvote") vote types
              const isUpvote = vote.voteType === "Upvote" || vote.voteType === 1 || (vote.voteType as any) === "1";
              
              return (
              <TouchableOpacity
                key={vote.proposalVoteId}
                onPress={() =>
                  router.push(`/(budget)/proposals/${vote.proposalId}`)
                }
                className="bg-white rounded-lg p-4 mb-2 flex-row items-center border border-gray-100"
                activeOpacity={0.7}
              >
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{
                    backgroundColor:
                      isUpvote
                        ? BudgetColors.vote.upvote + "20"
                        : BudgetColors.vote.downvote + "20",
                  }}
                >
                  <MaterialCommunityIcons
                    name={
                      isUpvote
                        ? "arrow-up-bold"
                        : "arrow-down-bold"
                    }
                    size={20}
                    color={
                      isUpvote
                        ? BudgetColors.vote.upvote
                        : BudgetColors.vote.downvote
                    }
                  />
                </View>

                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-800">
                    {vote.proposalTitle}
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <Text className="text-xs text-gray-500">
                      {vote.categoryName}
                    </Text>
                    <Text className="text-xs text-gray-400 mx-2">•</Text>
                    <Text className="text-xs text-gray-500">
                      {formatDate(vote.votedAt)}
                    </Text>
                  </View>
                </View>

                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color="#CBD5E1"
                />
              </TouchableOpacity>
            );
            })
          ) : (
            <View className="bg-white rounded-xl p-8 items-center">
              <MaterialCommunityIcons
                name="vote-outline"
                size={60}
                color="#CBD5E1"
              />
              <Text className="text-gray-400 mt-4 text-center">
                You haven't voted on any proposals yet
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(budget)/proposals")}
                className="mt-4 px-6 py-3 rounded-full"
                style={{ backgroundColor: BudgetColors.primary.green }}
              >
                <Text className="text-white font-semibold">
                  Browse Community Ideas
                </Text>
              </TouchableOpacity>
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
          onPress={() => router.push("/(budget)/proposals")}
        >
          <MaterialCommunityIcons
            name="lightbulb-outline"
            size={24}
            color="#94A3B8"
          />
          <Text className="text-xs text-gray-500 mt-1">Ideas</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 items-center py-3"
          style={{ backgroundColor: BudgetColors.primary.green + "10" }}
          onPress={() => router.push("/(budget)/impact")}
        >
          <MaterialCommunityIcons
            name="chart-line"
            size={24}
            color={BudgetColors.primary.green}
          />
          <Text
            className="text-xs font-semibold mt-1"
            style={{ color: BudgetColors.primary.green }}
          >
            My Impact
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
