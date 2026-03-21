import { ASSET_COLORS, STATUS_COLORS } from "@/config/assetConfig";
import {
  ASSET_STATUS_LABELS,
  AssetType,
  Bin,
  BusStop,
  InfrastructureAsset,
  Library,
  Park,
  Playground,
  Streetlight,
} from "@/types/infrastructure";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import AssetIcon from "./AssetIcon";

interface AssetDetailCardProps {
  asset: InfrastructureAsset;
}

const InfoRow: React.FC<{
  label: string;
  value: string | number | boolean;
}> = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}:</Text>
    <Text style={styles.infoValue}>
      {typeof value === "boolean" ? (value ? "Yes" : "No") : value}
    </Text>
  </View>
);

const AssetDetailCard: React.FC<AssetDetailCardProps> = ({ asset }) => {
  const statusLabel = ASSET_STATUS_LABELS[asset.status];
  const statusColor = STATUS_COLORS[asset.status];

  // Convert string assetType to number for use with enum-based configs
  const assetTypeNum =
    typeof asset.assetType === "string"
      ? AssetType[asset.assetType as keyof typeof AssetType]
      : asset.assetType;

  const renderTypeSpecificDetails = () => {
    switch (assetTypeNum) {
      case AssetType.Library: {
        const library = asset as Library;
        return (
          <>
            {library.metadata.openingHours && (
              <InfoRow
                label="Opening Hours"
                value={library.metadata.openingHours}
              />
            )}
            {library.metadata.openDays && (
              <InfoRow label="Open Days" value={library.metadata.openDays} />
            )}
            {library.metadata.facilities && (
              <InfoRow label="Facilities" value={library.metadata.facilities} />
            )}
            <InfoRow label="WiFi Available" value={library.metadata.hasWifi} />
            {library.metadata.phone && (
              <InfoRow label="Phone" value={library.metadata.phone} />
            )}
            {library.metadata.email && (
              <InfoRow label="Email" value={library.metadata.email} />
            )}
            {library.metadata.mobile && (
              <InfoRow label="Mobile" value={library.metadata.mobile} />
            )}
          </>
        );
      }

      case AssetType.Streetlight: {
        const light = asset as Streetlight;
        const bulbTypeLabels = ["LED", "Halogen", "Sodium", "Fluorescent"];
        const conditionLabels = ["Good", "Fair", "Poor", "Critical"];
        return (
          <>
            <InfoRow
              label="Bulb Type"
              value={bulbTypeLabels[light.metadata.bulbType]}
            />
            <InfoRow label="Wattage" value={`${light.metadata.wattage}W`} />
            <InfoRow
              label="Height"
              value={`${light.metadata.height_Meters}m`}
            />
            <InfoRow
              label="Pole Condition"
              value={conditionLabels[light.metadata.poleCondition]}
            />
            <InfoRow label="Solar Powered" value={light.metadata.solar} />
            {light.metadata.lastMaintenanceDate && (
              <InfoRow
                label="Last Maintenance"
                value={new Date(
                  light.metadata.lastMaintenanceDate,
                ).toLocaleDateString()}
              />
            )}
          </>
        );
      }

      case AssetType.Playground: {
        const playground = asset as Playground;
        const entranceLabels = ["Free", "Reservation", "Paid"];
        return (
          <>
            <InfoRow
              label="Area"
              value={`${playground.metadata.area_SqMeters} sq m`}
            />
            {playground.metadata.facilities && (
              <InfoRow
                label="Facilities"
                value={playground.metadata.facilities}
              />
            )}
            <InfoRow label="Has Shade" value={playground.metadata.hasShade} />
            <InfoRow
              label="Entrance"
              value={entranceLabels[playground.metadata.entrance]}
            />
            {playground.metadata.phone && (
              <InfoRow label="Phone" value={playground.metadata.phone} />
            )}
          </>
        );
      }

      case AssetType.Bin: {
        const bin = asset as Bin;
        const binTypeLabels = ["General", "Recycling", "Organic", "Hazardous"];
        const binTypeValue =
          typeof bin.metadata.binType === "string"
            ? bin.metadata.binType
            : binTypeLabels[bin.metadata.binType];
        return (
          <>
            <InfoRow
              label="Capacity"
              value={`${bin.metadata.capacity_Liters}L`}
            />
            <InfoRow label="Bin Type" value={binTypeValue} />
            {bin.metadata.collectionDay && (
              <InfoRow
                label="Collection Day"
                value={bin.metadata.collectionDay}
              />
            )}
            {bin.metadata.lastEmptied && (
              <InfoRow
                label="Last Emptied"
                value={new Date(bin.metadata.lastEmptied).toLocaleDateString()}
              />
            )}
          </>
        );
      }

      case AssetType.BusStop: {
        const busStop = asset as BusStop;
        return (
          <>
            {busStop.metadata.routesServed && (
              <InfoRow label="Routes" value={busStop.metadata.routesServed} />
            )}
            <InfoRow label="Has Shelter" value={busStop.metadata.hasShelter} />
            <InfoRow label="Has Bench" value={busStop.metadata.hasBench} />
            {busStop.metadata.timetable && (
              <InfoRow label="Timetable" value={busStop.metadata.timetable} />
            )}
          </>
        );
      }

      case AssetType.Park: {
        const park = asset as Park;
        const entranceLabels = ["Free", "Reservation", "Paid"];
        return (
          <>
            <InfoRow
              label="Area"
              value={`${park.metadata.area_SqMeters} sq m`}
            />
            {park.metadata.facilities && (
              <InfoRow label="Facilities" value={park.metadata.facilities} />
            )}
            {park.metadata.openingHours && (
              <InfoRow
                label="Opening Hours"
                value={park.metadata.openingHours}
              />
            )}
            <InfoRow
              label="Entrance"
              value={entranceLabels[park.metadata.entrance]}
            />
            <InfoRow
              label="Has Playground"
              value={park.metadata.hasPlayground}
            />
            <InfoRow label="Has Parking" value={park.metadata.hasParking} />
          </>
        );
      }

      default:
        return null;
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <AssetIcon
          assetType={assetTypeNum}
          size={48}
          color={ASSET_COLORS[assetTypeNum]}
        />
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{asset.assetName}</Text>
          {asset.assetCode && (
            <Text style={styles.code}>{asset.assetCode}</Text>
          )}
        </View>
      </View>

      <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
        <Text style={styles.statusText}>{statusLabel}</Text>
      </View>

      <View style={styles.divider} />

      <ScrollView
        style={styles.detailsContainer}
        showsVerticalScrollIndicator={false}
      >
        {renderTypeSpecificDetails()}

        {asset.note && (
          <View style={styles.noteContainer}>
            <Text style={styles.noteLabel}>Note:</Text>
            <Text style={styles.noteText}>{asset.note}</Text>
          </View>
        )}

        <View style={styles.metaContainer}>
          <Text style={styles.metaText}>
            Created: {new Date(asset.createdAt).toLocaleDateString()}
          </Text>
          <Text style={styles.metaText}>
            Updated: {new Date(asset.updatedAt).toLocaleDateString()}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 16,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  code: {
    fontSize: 14,
    color: "#6B7280",
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginBottom: 16,
  },
  detailsContainer: {
    maxHeight: 300,
  },
  infoRow: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    width: 150,
  },
  infoValue: {
    fontSize: 14,
    color: "#374151",
    flex: 1,
  },
  noteContainer: {
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
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
    lineHeight: 20,
  },
  metaContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  metaText: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 4,
  },
});

export default AssetDetailCard;
