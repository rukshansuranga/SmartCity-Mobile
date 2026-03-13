import { ASSET_COLORS } from "@/config/assetConfig";
import { AssetType } from "@/types/infrastructure";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AssetIcon from "./AssetIcon";

interface CategoryItem {
  type: AssetType;
  label: string;
  count?: number;
}

interface Props {
  categories: CategoryItem[];
  onCategoryPress: (assetType: AssetType) => void;
}

const AssetCategoryGrid: React.FC<Props> = ({
  categories,
  onCategoryPress,
}) => {
  const safeCategories = categories || [];

  return (
    <View style={styles.grid}>
      {safeCategories.map((category) => (
        <TouchableOpacity
          key={category.type}
          style={[styles.tile, { borderColor: ASSET_COLORS[category.type] }]}
          onPress={() => onCategoryPress(category.type)}
          activeOpacity={0.7}
        >
          <AssetIcon
            assetType={category.type}
            size={48}
            color={ASSET_COLORS[category.type]}
          />
          <Text style={styles.label}>{category.label}</Text>
          {category.count !== undefined && (
            <Text style={styles.count}>({category.count})</Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 8,
  },
  tile: {
    width: "48%",
    margin: "1%",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 3,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    color: "#1F2937",
  },
  count: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
});

export default AssetCategoryGrid;
