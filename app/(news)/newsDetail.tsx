import { CategoryBadge } from "@/components/news/CategoryBadge";
import { PriorityBadge } from "@/components/news/PriorityBadge";
import { NewsCategory, NewsPriority } from "@/enums/enum";
import { useAuthStore } from "@/stores/authStore";
import { useNewsStore } from "@/stores/newsStore";
import { useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Image, ScrollView, Text, View } from "react-native";

export default function NewsDetailScreen() {
  const { newsId } = useLocalSearchParams<{ newsId: string }>();
  const { userInfo } = useAuthStore();
  const {
    currentNews,
    isLoadingDetail,
    error,
    loadNewsDetail,
    clearCurrentNews,
  } = useNewsStore();

  useEffect(() => {
    if (userInfo?.sub && newsId) {
      loadNewsDetail(userInfo.sub, parseInt(newsId));
    }

    return () => {
      clearCurrentNews();
    };
  }, [userInfo?.sub, newsId]);

  if (isLoadingDetail) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#38a3a5" />
        <Text className="mt-4 text-gray-600">Loading news...</Text>
      </View>
    );
  }

  if (error || !currentNews) {
    return (
      <View className="flex-1 justify-center items-center bg-white px-6">
        <Text className="text-red-500 text-lg font-semibold mb-2">
          ⚠️ Error
        </Text>
        <Text className="text-gray-600 text-center">
          {error || "News not found"}
        </Text>
      </View>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Cover Image */}
      {currentNews.coverImageUrl && (
        <Image
          source={{ uri: currentNews.coverImageUrl }}
          className="w-full h-64"
          resizeMode="cover"
        />
      )}

      <View className="p-4">
        {/* Badges */}
        <View className="flex-row flex-wrap gap-2 mb-4">
          <CategoryBadge category={currentNews.category as NewsCategory} />
          <PriorityBadge priority={currentNews.priority as NewsPriority} />
          {currentNews.isRecurrent && (
            <View className="bg-indigo-100 px-3 py-1.5 rounded-full">
              <Text className="text-indigo-700 text-xs font-semibold">
                🔄 Recurrent
              </Text>
            </View>
          )}
        </View>

        {/* Title */}
        <Text className="text-2xl font-bold text-gray-900 mb-3 leading-8">
          {currentNews.title}
        </Text>

        {/* Date */}
        <Text className="text-sm text-gray-500 mb-4">
          {currentNews.publishedDateTime
            ? `Published: ${formatDate(currentNews.publishedDateTime)}`
            : `Created: ${formatDate(currentNews.createdAt)}`}
        </Text>

        {/* Summary */}
        {currentNews.summary && (
          <View className="bg-gray-100 p-4 rounded-lg mb-4">
            <Text className="text-base text-gray-700 leading-6 italic">
              {currentNews.summary}
            </Text>
          </View>
        )}

        {/* Content */}
        <Text className="text-base text-gray-800 leading-7 mb-5">
          {currentNews.content}
        </Text>

        {/* Media Gallery */}
        {currentNews.mediaUrls && currentNews.mediaUrls.length > 0 && (
          <View className="mb-5">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Media
            </Text>
            {currentNews.mediaUrls.map((url, index) => (
              <Image
                key={index}
                source={{ uri: url }}
                className="w-full h-52 rounded-lg mb-3"
                resizeMode="cover"
              />
            ))}
          </View>
        )}

        {/* Target Regions */}
        {currentNews.targetRegions && currentNews.targetRegions.length > 0 && (
          <View className="mb-5">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Regions:
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {currentNews.targetRegions.map((region, index) => (
                <View key={index} className="bg-blue-50 px-3 py-1 rounded-full">
                  <Text className="text-blue-700 text-xs font-medium">
                    📍 {region}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Read Status */}
        {currentNews.isRead && currentNews.readAt && (
          <View className="bg-green-50 p-3 rounded-lg border-l-4 border-green-500">
            <Text className="text-sm text-green-700 font-medium">
              ✓ Read on {formatDate(currentNews.readAt)}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
