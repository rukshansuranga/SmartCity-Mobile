import { NewsPriority } from "@/enums/enum";
import { Text, View } from "react-native";

interface PriorityBadgeProps {
  priority: NewsPriority | string;
}

const priorityConfig = {
  [NewsPriority.Low]: {
    bg: "bg-gray-100",
    text: "text-gray-700",
    icon: "📌",
  },
  [NewsPriority.Medium]: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    icon: "📍",
  },
  [NewsPriority.High]: {
    bg: "bg-orange-100",
    text: "text-orange-700",
    icon: "⚠️",
  },
  [NewsPriority.Critical]: {
    bg: "bg-red-100",
    text: "text-red-700",
    icon: "🚨",
  },
};

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const config =
    priorityConfig[priority as NewsPriority] ||
    priorityConfig[NewsPriority.Low];

  return (
    <View
      className={`${config.bg} px-3 py-1.5 rounded-full flex-row items-center`}
    >
      <Text className={`${config.text} text-xs font-semibold`}>
        {config.icon} {priority}
      </Text>
    </View>
  );
}
