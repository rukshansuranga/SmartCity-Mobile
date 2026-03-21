import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { Button } from "react-native-paper";

type ProjectTypeItem = {
  label: string;
  route: string;
  color: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  textColor: string;
};

type ProjectCategory = {
  title: string;
  items: ProjectTypeItem[];
};

export default function Index() {
  const router = useRouter();

  const projectCategories: ProjectCategory[] = [
    {
      title: "Infrastructure",
      items: [
        {
          label: "Road",
          route: "/projectList?projectType=Road",
          color: "#4A5568",
          icon: "road-variant",
          textColor: "#FFFFFF",
        },
        {
          label: "Bridge",
          route: "/projectList?projectType=Bridge",
          color: "#2D3748",
          icon: "bridge",
          textColor: "#FFFFFF",
        },
        {
          label: "Culvert",
          route: "/projectList?projectType=Culvert",
          color: "#718096",
          icon: "pipe",
          textColor: "#FFFFFF",
        },
        {
          label: "Street Lighting",
          route: "/projectList?projectType=StreetLighting",
          color: "#F59E0B",
          icon: "lightbulb-on",
          textColor: "#FFFFFF",
        },
      ],
    },
    {
      title: "Water & Sanitation",
      items: [
        {
          label: "Water Supply",
          route: "/projectList?projectType=WaterSupply",
          color: "#0EA5E9",
          icon: "water-pump",
          textColor: "#FFFFFF",
        },
        {
          label: "Pipeline",
          route: "/projectList?projectType=Pipeline",
          color: "#06B6D4",
          icon: "pipe-valve",
          textColor: "#FFFFFF",
        },
        {
          label: "Drainage",
          route: "/projectList?projectType=Drainage",
          color: "#3B82F6",
          icon: "water-outline",
          textColor: "#FFFFFF",
        },
        {
          label: "Sewerage",
          route: "/projectList?projectType=Sewerage",
          color: "#1E40AF",
          icon: "water-off",
          textColor: "#FFFFFF",
        },
        {
          label: "Irrigation",
          route: "/projectList?projectType=Irrigation",
          color: "#3182CE",
          icon: "water",
          textColor: "#FFFFFF",
        },
        {
          label: "Reservoir",
          route: "/projectList?projectType=Reservoir",
          color: "#0891B2",
          icon: "water-well",
          textColor: "#FFFFFF",
        },
        {
          label: "Water Treatment",
          route: "/projectList?projectType=WaterTreatmentPlant",
          color: "#0369A1",
          icon: "water-check",
          textColor: "#FFFFFF",
        },
      ],
    },
    {
      title: "Buildings & Facilities",
      items: [
        {
          label: "Building",
          route: "/projectList?projectType=Building",
          color: "#DC2626",
          icon: "office-building",
          textColor: "#FFFFFF",
        },
        {
          label: "Park",
          route: "/projectList?projectType=Park",
          color: "#16A34A",
          icon: "tree",
          textColor: "#FFFFFF",
        },
        {
          label: "Recreation Area",
          route: "/projectList?projectType=RecreationArea",
          color: "#22C55E",
          icon: "run",
          textColor: "#FFFFFF",
        },
        {
          label: "Community Center",
          route: "/projectList?projectType=CommunityCenter",
          color: "#EC4899",
          icon: "account-group",
          textColor: "#FFFFFF",
        },
        {
          label: "Public Library",
          route: "/projectList?projectType=PublicLibrary",
          color: "#6366F1",
          icon: "book-open-variant",
          textColor: "#FFFFFF",
        },
        {
          label: "Health Center",
          route: "/projectList?projectType=HealthCenter",
          color: "#EF4444",
          icon: "hospital-building",
          textColor: "#FFFFFF",
        },
      ],
    },
    {
      title: "Waste Management",
      items: [
        {
          label: "Waste Management",
          route: "/projectList?projectType=WasteManagement",
          color: "#059669",
          icon: "delete",
          textColor: "#FFFFFF",
        },
        {
          label: "Landfill",
          route: "/projectList?projectType=Landfill",
          color: "#78350F",
          icon: "landfill",
          textColor: "#FFFFFF",
        },
        {
          label: "Recycling Center",
          route: "/projectList?projectType=RecyclingCenter",
          color: "#10B981",
          icon: "recycle",
          textColor: "#FFFFFF",
        },
      ],
    },
    {
      title: "Other",
      items: [
        {
          label: "Other",
          route: "/projectList?projectType=Other",
          color: "#8B5CF6",
          icon: "dots-horizontal-circle",
          textColor: "#FFFFFF",
        },
      ],
    },
  ];

  return (
    <ScrollView className="flex-1 bg-[#c7f9cc]">
      <View className="px-4 py-6">
        {projectCategories.map((category) => (
          <View key={category.title} className="mb-6">
            <Text className="text-2xl font-bold text-gray-800 mb-4 px-2">
              {category.title}
            </Text>
            <View className="flex-row flex-wrap justify-between gap-4">
              {category.items.map(
                ({ label, route, color, icon, textColor }) => (
                  <View
                    key={label}
                    className="justify-center items-center rounded-xl shadow-md"
                    style={{
                      backgroundColor: color,
                      width: "47%",
                      aspectRatio: 1.2,
                    }}
                  >
                    <Button
                      onPress={() => router.push(route as any)}
                      style={{ width: "100%", height: "100%" }}
                      contentStyle={{
                        height: "100%",
                        justifyContent: "center",
                      }}
                    >
                      <View className="items-center gap-2">
                        <MaterialCommunityIcons
                          name={icon}
                          size={40}
                          color={textColor}
                        />
                        <Text
                          className="font-bold text-base tracking-wide text-center px-2"
                          style={{ color: textColor }}
                          numberOfLines={2}
                        >
                          {label}
                        </Text>
                      </View>
                    </Button>
                  </View>
                ),
              )}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
