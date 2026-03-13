import { getProposalDetail } from "@/api/proposalAction";
import { StatusBadge } from "@/components/budget/StatusBadge";
import { ProposalDetail } from "@/types/proposal";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

export default function ProposalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [proposal, setProposal] = useState<ProposalDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProposal();
  }, [id]);

  const loadProposal = async () => {
    try {
      setLoading(true);
      const response = await getProposalDetail(Number(id));
      if (response.isSuccess && response.data) {
        setProposal(response.data);
      }
    } catch (error) {
      console.error("Error loading proposal:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!proposal) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-gray-600">Proposal not found</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Proposal Details",
          headerShown: true,
        }}
      />
      <ScrollView className="flex-1 bg-gray-50">
        <View className="bg-white p-4 mb-3">
          {/* Header */}
          <Text className="text-2xl font-bold text-gray-800 mb-2">
            {proposal.title}
          </Text>

          <View className="flex-row items-center gap-2 mb-3">
            <StatusBadge status={proposal.status} size="md" />
            <Text className="text-sm text-gray-500">
              • {proposal.categoryName}
            </Text>
          </View>

          {/* Author and Cost */}
          <View className="flex-row items-center mb-4">
            <MaterialCommunityIcons name="account" size={18} color="#64748B" />
            <Text className="text-sm text-gray-600 ml-1 mr-4">
              by {proposal.residentName}
            </Text>
            <MaterialCommunityIcons name="cash" size={18} color="#64748B" />
            <Text className="text-sm text-gray-600 ml-1">
              {proposal.estimatedCost.toLocaleString()}
            </Text>
          </View>

          {/* Description */}
          <Text className="text-base text-gray-700 leading-6">
            {proposal.detailedDescription || proposal.description}
          </Text>
        </View>

        {/* Voting Stats */}
        <View className="bg-white p-4 mb-3">
          <Text className="text-lg font-bold text-gray-800 mb-3">
            Community Feedback
          </Text>
          <View className="flex-row items-center gap-6">
            <View className="flex-row items-center">
              <MaterialCommunityIcons
                name="arrow-up-bold"
                size={24}
                color="#22C55E"
              />
              <Text className="text-lg font-semibold text-gray-800 ml-2">
                {proposal.upvotes || 0}
              </Text>
            </View>
            <View className="flex-row items-center">
              <MaterialCommunityIcons
                name="arrow-down-bold"
                size={24}
                color="#EF4444"
              />
              <Text className="text-lg font-semibold text-gray-800 ml-2">
                {proposal.downvotes || 0}
              </Text>
            </View>
            <View className="flex-row items-center">
              <MaterialCommunityIcons
                name="comment-text"
                size={24}
                color="#3B82F6"
              />
              <Text className="text-lg font-semibold text-gray-800 ml-2">
                {proposal.commentCount || 0}
              </Text>
            </View>
          </View>
        </View>

        {/* Status History */}
        {proposal.statusHistory && proposal.statusHistory.length > 0 && (
          <View className="bg-white p-4 mb-3">
            <Text className="text-lg font-bold text-gray-800 mb-3">
              Status History
            </Text>
            {proposal.statusHistory.map((status, index) => (
              <View key={index} className="flex-row items-start mb-3">
                <View className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3" />
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-gray-800">
                    {status.status}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {new Date(status.statusDate).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </>
  );
}
