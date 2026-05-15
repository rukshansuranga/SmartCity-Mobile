import { NewsCard } from "@/components/news/NewsCard";
import { useAuthStore } from "@/stores/authStore";
import { useNewsStore } from "@/stores/newsStore";
import { NewsItem } from "@/types";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from "react-native";

export default function NewsFeedScreen() {
  const router = useRouter();
  const { userInfo } = useAuthStore();
  const {
    newsList,
    isLoading,
    isRefreshing,
    hasMore,
    currentPage,
    error,
    loadNewsFeed,
    refreshNewsFeed,
    loadUnreadCount,
  } = useNewsStore();

  useEffect(() => {
    if (userInfo?.sub) {
      // Load initial news feed
      loadNewsFeed(userInfo.sub, 1);
      // Load unread count
      loadUnreadCount(userInfo.sub);
    }
  }, [userInfo?.sub]);

  const handleRefresh = () => {
    if (userInfo?.sub) {
      refreshNewsFeed(userInfo.sub);
    }
  };

  const handleLoadMore = () => {
    if (userInfo?.sub && hasMore && !isLoading) {
      loadNewsFeed(userInfo.sub, currentPage + 1);
    }
  };

  const handleNewsPress = (newsId: number) => {
    router.push(`/(news)/newsDetail?newsId=${newsId}` as any);
  };

  if (isLoading && newsList.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#38a3a5" />
        <Text className="mt-4 text-gray-600">Loading news...</Text>
      </View>
    );
  }

  if (error && newsList.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 px-6">
        <Text className="text-red-500 text-lg font-semibold mb-2">
          ⚠️ Error
        </Text>
        <Text className="text-gray-600 text-center">{error}</Text>
      </View>
    );
  }

  if (newsList.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 px-6">
        <Text className="text-6xl mb-4">📰</Text>
        <Text className="text-gray-500 text-lg font-semibold mb-2">
          No news available
        </Text>
        <Text className="text-gray-400 text-center">
          Check back later for updates and announcements
        </Text>
      </View>
    );
  }

  const renderFooter = () => {
    if (!isLoading || newsList.length === 0) return null;
    return (
      <View className="py-4">
        <ActivityIndicator color="#38a3a5" />
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={newsList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }: { item: NewsItem }) => (
          <NewsCard news={item} onPress={() => handleNewsPress(item.id)} />
        )}
        contentContainerStyle={{ paddingVertical: 8 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={["#38a3a5"]}
            tintColor="#38a3a5"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
      />
    </View>
  );
}
