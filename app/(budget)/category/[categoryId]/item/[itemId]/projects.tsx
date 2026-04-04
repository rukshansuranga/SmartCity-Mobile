import { getBudgetItemProjects } from "@/api/budgetAction";
import { BudgetItemProject } from "@/types/budgetItemProject";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";

export default function BudgetItemProjectsPage() {
  const { categoryId, itemId } = useLocalSearchParams<{
    categoryId: string;
    itemId: string;
  }>();
  const [projects, setProjects] = useState<BudgetItemProject[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (itemId) {
      setLoading(true);
      getBudgetItemProjects(Number(itemId))
        .then((res) => {
          if (res.isSuccess) {
            setProjects(res.data);
            setError(null);
          } else {
            setError(res.message || "Failed to load projects");
            setProjects([]);
          }
        })
        .catch(() => {
          setError("Failed to load projects");
          setProjects([]);
        })
        .finally(() => setLoading(false));
    }
  }, [itemId]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-red-600">{error}</Text>
      </View>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text>No projects for this budget item.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-xl font-bold mb-4">Projects for Budget Item</Text>
      <FlatList
        data={projects}
        keyExtractor={(item) => item.projectId.toString()}
        renderItem={({ item }) => (
          <View className="mb-4 p-4 border rounded-lg bg-gray-50">
            <Text className="font-semibold text-lg">{item.name}</Text>
            <Text>Category: {item.category}</Text>
            <Text>Estimation: {item.estimation.toLocaleString()}</Text>
            <Text>Total Paid: {item.totalPaid.toLocaleString()}</Text>
          </View>
        )}
      />
    </View>
  );
}
