import { NewsCategory, NewsPriority } from "@/enums/enum";
import { NewsItem } from "@/types";
import { Image, Pressable, Text, View } from "react-native";
import { CategoryBadge } from "./CategoryBadge";
import { PriorityBadge } from "./PriorityBadge";

interface NewsCardProps {
  news: NewsItem;
  onPress: () => void;
}

export function NewsCard({ news, onPress }: NewsCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Pressable
      onPress={onPress}
      className="bg-white mx-4 my-2 rounded-xl shadow-md active:opacity-80"
    >
      {/* Cover Image */}
      {news.coverImageUrl && (
        <Image
          source={{ uri: news.coverImageUrl }}
          className="w-full h-48 rounded-t-xl"
          resizeMode="cover"
        />
      )}

      <View className="p-4">
        {/* Header */}
        <View className="flex-row justify-between items-start mb-2">
          <Text
            className={`text-lg font-semibold flex-1 ${news.isRead ? "text-gray-600" : "text-gray-900"}`}
            numberOfLines={2}
          >
            {news.title}
          </Text>
          {news.isRecurrent && (
            <View className="ml-2 bg-indigo-100 px-2 py-1 rounded-lg">
              <Text className="text-indigo-700 text-xs font-medium">🔄</Text>
            </View>
          )}
        </View>

        {/* Summary */}
        {news.summary && (
          <Text
            className={`text-sm mb-3 leading-5 ${news.isRead ? "text-gray-500" : "text-gray-700"}`}
            numberOfLines={2}
          >
            {news.summary}
          </Text>
        )}

        {/* Badges */}
        <View className="flex-row flex-wrap gap-2 mb-3">
          <CategoryBadge category={news.category as NewsCategory} />
          <PriorityBadge priority={news.priority as NewsPriority} />
        </View>

        {/* Footer */}
        <View className="flex-row justify-between items-center">
          <Text className="text-xs text-gray-500">
            {news.publishedDateTime
              ? formatDate(news.publishedDateTime)
              : formatDate(news.createdAt)}
          </Text>
          {!news.isRead && (
            <View className="bg-blue-500 w-2 h-2 rounded-full" />
          )}
        </View>
      </View>
    </Pressable>
  );
}
