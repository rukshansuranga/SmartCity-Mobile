import { NewsCategory } from "@/enums/enum";
import { Text, View } from "react-native";

interface CategoryBadgeProps {
  category: NewsCategory | string;
}

const categoryConfig = {
  [NewsCategory.GeneralAnnouncement]: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    label: "General",
  },
  [NewsCategory.EmergencyAlert]: {
    bg: "bg-red-100",
    text: "text-red-700",
    label: "Emergency",
  },
  [NewsCategory.Event]: {
    bg: "bg-purple-100",
    text: "text-purple-700",
    label: "Event",
  },
  [NewsCategory.InfrastructureUpdate]: {
    bg: "bg-orange-100",
    text: "text-orange-700",
    label: "Infrastructure",
  },
  [NewsCategory.ServiceDisruption]: {
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    label: "Service",
  },
  [NewsCategory.CommunityNews]: {
    bg: "bg-green-100",
    text: "text-green-700",
    label: "Community",
  },
};

export function CategoryBadge({ category }: CategoryBadgeProps) {
  const config =
    categoryConfig[category as NewsCategory] ||
    categoryConfig[NewsCategory.GeneralAnnouncement];

  return (
    <View className={`${config.bg} px-3 py-1.5 rounded-full`}>
      <Text className={`${config.text} text-xs font-semibold`}>
        {config.label}
      </Text>
    </View>
  );
}
