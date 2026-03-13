import { ASSET_COLORS, STATUS_COLORS } from "@/config/assetConfig";
import {
  ASSET_STATUS_LABELS,
  InfrastructureAsset,
} from "@/types/infrastructure";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AssetIcon from "./AssetIcon";

interface Props {
  asset: InfrastructureAsset | null;
  bottomSheetRef: React.RefObject<BottomSheet>;
  onViewDetails: () => void;
  onReportIssue: () => void;
}

const AssetPreviewSheet: React.FC<Props> = ({
  asset,
  bottomSheetRef,
  onViewDetails,
  onReportIssue,
}) => {
  const statusLabel = asset ? ASSET_STATUS_LABELS[asset.status] : "";
  const statusColor = asset ? STATUS_COLORS[asset.status] : "#6B7280";

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={["25%", "40%"]}
      enablePanDownToClose
      backgroundStyle={styles.bottomSheetBackground}
    >
      <BottomSheetView style={styles.container}>
        {asset && (
          <ScrollView>
            <View style={styles.header}>
              <AssetIcon
                assetType={asset.assetType}
                size={52}
                color={ASSET_COLORS[asset.assetType]}
              />
              <View style={styles.info}>
                <Text style={styles.name}>{asset.assetName}</Text>
                {asset.assetCode && (
                  <Text style={styles.code}>{asset.assetCode}</Text>
                )}
                <View
                  style={[styles.statusBadge, { backgroundColor: statusColor }]}
                >
                  <Text style={styles.statusText}>{statusLabel}</Text>
                </View>
              </View>
            </View>

            {asset.note && (
              <View style={styles.noteContainer}>
                <Text style={styles.noteLabel}>Note:</Text>
                <Text style={styles.noteText}>{asset.note}</Text>
              </View>
            )}

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.buttonSecondary}
                onPress={onViewDetails}
                activeOpacity={0.7}
              >
                <Text style={styles.buttonTextSecondary}>View Details</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.buttonPrimary,
                  { backgroundColor: ASSET_COLORS[asset.assetType] },
                ]}
                onPress={onReportIssue}
                activeOpacity={0.7}
              >
                <Text style={styles.buttonTextPrimary}>Report Issue</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  container: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
    gap: 16,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  code: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  noteContainer: {
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  noteLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 4,
  },
  noteText: {
    fontSize: 14,
    color: "#374151",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  buttonSecondary: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    alignItems: "center",
  },
  buttonPrimary: {
    flex: 1,
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonTextSecondary: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  buttonTextPrimary: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});

export default AssetPreviewSheet;
