import { getLandparcelsByResidentId } from "@/api/taxAction";
import { LandParcel, TaxableUnit } from "@/types";
import React, { useEffect, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

interface LandParcelTableProps {
  residentId: string;
}

const LandParcelTable: React.FC<LandParcelTableProps> = ({ residentId }) => {
  const [landParcels, setLandParcels] = useState<LandParcel[]>([]);
  const [expandedRows, setExpandedRows] = useState<number[]>([]);

  console.log("LandParcelTable residentId:", residentId);

  useEffect(() => {
    const fetchLandParcels = async () => {
      try {
        const response = await getLandparcelsByResidentId(residentId);
        if (response.isSuccess) {
          setLandParcels(response.data);
          if (response.data.length > 0) {
            setExpandedRows([response.data[0].landParcelID]);
          }
        } else {
          console.error("Failed to fetch land parcels", response.message);
        }
      } catch (error) {
        console.error("Error fetching land parcels", error);
      }
    };

    fetchLandParcels();
  }, [residentId]);

  const toggleRow = (landParcelId: number) => {
    setExpandedRows((prev) =>
      prev.includes(landParcelId)
        ? prev.filter((id) => id !== landParcelId)
        : [...prev, landParcelId]
    );
  };

  const renderUnit = ({ item }: { item: TaxableUnit }) => (
    <View style={{ flexDirection: "row", padding: 8, borderBottomWidth: 1 }}>
      <Text style={{ flex: 1 }}>{item.taxableUnitID}</Text>
      <Text style={{ flex: 1 }}>{item.unitReference}</Text>
      <Text style={{ flex: 1 }}>{item.unitType}</Text>
    </View>
  );

  const renderParcel = ({ item }: { item: LandParcel }) => (
    <View style={{ marginBottom: 16 }}>
      <View className="flex flex-row justify-between">
        <Text>{item.streetAddress}</Text>

        <TouchableOpacity onPress={() => toggleRow(item.landParcelID)}>
          <Text style={{ color: "blue" }}>
            {expandedRows.includes(item.landParcelID) ? "Collapse" : "Expand"}
          </Text>
        </TouchableOpacity>
      </View>
      {expandedRows.includes(item.landParcelID) && (
        <View style={{ paddingLeft: 16 }}>
          {item.taxableUnits && item.taxableUnits.length > 0 ? (
            <>
              <View
                style={{
                  flexDirection: "row",
                  padding: 8,
                  borderBottomWidth: 1,
                }}
              >
                <Text style={{ flex: 1, fontWeight: "bold" }}>Unit ID</Text>
                <Text style={{ flex: 1, fontWeight: "bold" }}>Reference</Text>
                <Text style={{ flex: 1, fontWeight: "bold" }}>Unit Type</Text>
              </View>
              <FlatList
                data={item.taxableUnits}
                keyExtractor={(unit) => unit.taxableUnitID.toString()}
                renderItem={renderUnit}
              />
            </>
          ) : (
            <Text style={{ textAlign: "center", margin: 8 }}>
              No units available for this land parcel.
            </Text>
          )}
        </View>
      )}
    </View>
  );

  console.log(
    "Rendering LandParcelTable with parcels:",
    landParcels[0]?.taxableUnits
  );

  return (
    <View>
      {landParcels.length === 0 ? (
        <Text style={{ textAlign: "center", margin: 16 }}>
          No land parcels available.
        </Text>
      ) : (
        <>
          <FlatList
            data={landParcels}
            keyExtractor={(parcel) =>
              parcel.landParcelID
                ? parcel.landParcelID.toString()
                : `unknown-${Math.random()}`
            }
            renderItem={renderParcel}
          />
        </>
      )}
    </View>
  );
};

export default LandParcelTable;
