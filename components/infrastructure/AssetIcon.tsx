import { ASSET_ICON_CONFIG } from "@/config/assetConfig";
import { AssetType } from "@/types/infrastructure";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";

interface Props {
  assetType: AssetType;
  size?: number;
  color?: string;
}

const AssetIcon: React.FC<Props> = ({
  assetType,
  size = 24,
  color = "#000",
}) => {
  const iconConfig = ASSET_ICON_CONFIG[assetType];

  if (!iconConfig) return null;

  // Currently only supporting MaterialCommunityIcons, but can be extended
  if (iconConfig.family === "MaterialCommunityIcons") {
    return (
      <MaterialCommunityIcons
        name={iconConfig.name as any}
        size={size}
        color={color}
      />
    );
  }

  return null;
};

export default AssetIcon;
