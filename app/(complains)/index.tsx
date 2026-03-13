import { ASSET_COLORS, ASSET_ICONS } from "@/config/assetConfig";
import { AssetType } from "@/types/infrastructure";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { Button } from "react-native-paper";

export default function ComplainsIndex() {
  const router = useRouter();
  const buttons = [
    {
      label: "General",
      route: "/(complains)/general/GeneralComplainList",
      color: "#80ed99",
    },
    {
      label: "Project Complain",
      route: "/(complains)/project/SelectProjectForComplain",
      color: "#22577a",
    },
  ];

  // Infrastructure complaint buttons
  const infrastructureButtons = [
    {
      label: `${ASSET_ICONS[AssetType.Library]} Library`,
      assetType: AssetType.Library,
      color: ASSET_COLORS[AssetType.Library],
    },
    {
      label: `${ASSET_ICONS[AssetType.Playground]} Playground`,
      assetType: AssetType.Playground,
      color: ASSET_COLORS[AssetType.Playground],
    },
    {
      label: `${ASSET_ICONS[AssetType.Streetlight]} Streetlight`,
      assetType: AssetType.Streetlight,
      color: ASSET_COLORS[AssetType.Streetlight],
    },
    {
      label: `${ASSET_ICONS[AssetType.BusStop]} Bus Stop`,
      assetType: AssetType.BusStop,
      color: ASSET_COLORS[AssetType.BusStop],
    },
    {
      label: `${ASSET_ICONS[AssetType.Park]} Park`,
      assetType: AssetType.Park,
      color: ASSET_COLORS[AssetType.Park],
    },
    {
      label: `${ASSET_ICONS[AssetType.Bin]} Bin`,
      assetType: AssetType.Bin,
      color: ASSET_COLORS[AssetType.Bin],
    },
  ];

  const handleInfrastructurePress = (assetType: AssetType) => {
    router.push({
      pathname: "/(infrastructure)/map/[type]",
      params: { type: assetType.toString(), fromComplains: "true" },
    });
  };

  return (
    <View className="flex-1 justify-center items-center gap-3 bg-[#c7f9cc] px-4 py-4">
      <Text className="text-xl font-bold text-[#22577a] mb-2">
        General Complaints
      </Text>
      {buttons.map(({ label, route, color }) => (
        <View
          key={label}
          className="flex justify-center items-center w-full rounded-xl shadow-md h-16 px-6"
          style={{ backgroundColor: color }}
        >
          <Button
            onPress={route ? () => router.push(route as any) : undefined}
            style={{ width: "100%", height: "100%" }}
            contentStyle={{ height: "100%" }}
          >
            <Text className="font-bold text-lg tracking-wide text-center w-full text-white">
              {label}
            </Text>
          </Button>
        </View>
      ))}

      <View className="w-full h-px bg-[#22577a] my-2" />

      <Text className="text-xl font-bold text-[#22577a] mb-2">
        Infrastructure Complaints
      </Text>
      <View className="flex-row flex-wrap justify-center gap-2 w-full">
        {infrastructureButtons.map(({ label, assetType, color }) => (
          <View
            key={assetType}
            className="w-[48%] rounded-xl shadow-md h-16 justify-center items-center"
            style={{ backgroundColor: color }}
          >
            <Button
              onPress={() => handleInfrastructurePress(assetType)}
              style={{ width: "100%", height: "100%" }}
              contentStyle={{ height: "100%" }}
            >
              <Text className="font-semibold text-sm text-center text-white">
                {label}
              </Text>
            </Button>
          </View>
        ))}
      </View>
    </View>
  );
}
