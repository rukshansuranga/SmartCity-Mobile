import { BudgetColors } from "@/constants/budgetColors";
import { ProposalCard as ProposalCardType, VoteType } from "@/types/proposal";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { StatusBadge } from "../budget/StatusBadge";

interface ProposalCardProps {
  proposal: ProposalCardType;
  onPress: () => void;
  onVote: (voteType: VoteType) => void;
}

export function ProposalCard({ proposal, onPress, onVote }: ProposalCardProps) {
  const netVotes = (proposal.upvoteCount || 0) - (proposal.downvoteCount || 0);

  // Convert userVoteType (number) to VoteType for comparison
  const userVote: VoteType | undefined =
    proposal.userVoteType === 1
      ? "Upvote"
      : proposal.userVoteType === -1
        ? "Downvote"
        : undefined;

  const handleVote = (voteType: VoteType) => {
    // If already voted same type, remove vote
    if (userVote === voteType) {
      onVote(voteType); // This will toggle/remove the vote
    } else {
      onVote(voteType);
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
      activeOpacity={0.7}
    >
      {/* Header */}
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-800 mb-1">
            {proposal.title}
          </Text>
          <View className="flex-row items-center gap-2">
            <StatusBadge status={proposal.status} size="sm" />
            <Text className="text-xs text-gray-500">
              • {proposal.categoryName}
            </Text>
          </View>
        </View>
      </View>

      {/* Description */}
      <Text className="text-sm text-gray-600 mb-3" numberOfLines={3}>
        {proposal.description}
      </Text>

      {/* Author and Cost */}
      <View className="flex-row items-center mb-3">
        <MaterialCommunityIcons name="account" size={16} color="#64748B" />
        <Text className="text-xs text-gray-600 ml-1 mr-3">
          by {proposal.residentName || "Unknown"}
        </Text>
        <MaterialCommunityIcons name="cash" size={16} color="#64748B" />
        <Text className="text-xs text-gray-600 ml-1">
          {proposal.estimatedCost.toLocaleString()}
        </Text>
      </View>

      {/* Voting Section */}
      <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
        <View className="flex-row items-center gap-3">
          {/* Upvote */}
          <TouchableOpacity
            onPress={() => handleVote("Upvote")}
            className="flex-row items-center px-3 py-2 rounded-full"
            style={{
              backgroundColor:
                userVote === "Upvote"
                  ? BudgetColors.vote.upvote + "20"
                  : "#F1F5F9",
            }}
          >
            <MaterialCommunityIcons
              name={
                userVote === "Upvote"
                  ? "arrow-up-bold"
                  : "arrow-up-bold-outline"
              }
              size={20}
              color={
                userVote === "Upvote" ? BudgetColors.vote.upvote : "#64748B"
              }
            />
            <Text
              className="ml-1 font-semibold"
              style={{
                color:
                  userVote === "Upvote" ? BudgetColors.vote.upvote : "#64748B",
              }}
            >
              {proposal.upvoteCount || 0}
            </Text>
          </TouchableOpacity>

          {/* Downvote */}
          <TouchableOpacity
            onPress={() => handleVote("Downvote")}
            className="flex-row items-center px-3 py-2 rounded-full"
            style={{
              backgroundColor:
                userVote === "Downvote"
                  ? BudgetColors.vote.downvote + "20"
                  : "#F1F5F9",
            }}
          >
            <MaterialCommunityIcons
              name={
                userVote === "Downvote"
                  ? "arrow-down-bold"
                  : "arrow-down-bold-outline"
              }
              size={20}
              color={
                userVote === "Downvote" ? BudgetColors.vote.downvote : "#64748B"
              }
            />
            <Text
              className="ml-1 font-semibold"
              style={{
                color:
                  userVote === "Downvote"
                    ? BudgetColors.vote.downvote
                    : "#64748B",
              }}
            >
              {proposal.downvoteCount || 0}
            </Text>
          </TouchableOpacity>

          {/* Net Score */}
          <View className="flex-row items-center px-3 py-2">
            <Text
              className="text-sm font-bold"
              style={{
                color:
                  netVotes > 0
                    ? BudgetColors.vote.upvote
                    : netVotes < 0
                      ? BudgetColors.vote.downvote
                      : "#64748B",
              }}
            >
              {netVotes > 0 ? "+" : ""}
              {netVotes}
            </Text>
          </View>
        </View>

        {/* Comments */}
        <View className="flex-row items-center">
          <MaterialCommunityIcons
            name="comment-text-outline"
            size={18}
            color="#64748B"
          />
          <Text className="text-sm text-gray-600 ml-1">
            {proposal.commentCount || 0}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
