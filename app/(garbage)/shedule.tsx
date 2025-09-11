import SheduleDay from "@/components/garbage/SheduleDay";
import { Picker } from "@react-native-picker/picker";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { Text } from "react-native-paper";

export default function Shedule() {
  const [region, setRegion] = useState("");
  const [regions, setRegions] = useState([]);
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    fetchRegions();
  }, []);

  async function fetchRegions() {
    try {
      const data = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/region`
      );

      const regions = await data.json();

      setRegions(regions);
    } catch (error) {
      console.log("error", error);
    }
  }

  async function fetchShedulesByRegion(region) {
    try {
      const data = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/garbage/${region}`
      );

      const list = await data.json();

      console.log("schedules", list);

      setSchedules(list);
    } catch (error) {
      console.log("error", error);
    }
  }

  function handleSheduleByRegion(region) {
    console.log("region", region);
    fetchShedulesByRegion(region);
    setRegion(region);
  }

  console.log("schedules", schedules);

  return (
    <View className="flex-1 justify-center items-center gap-5">
      <View className="w-full  px-4">
        <Picker
          selectedValue={region}
          onValueChange={(itemValue, itemIndex) =>
            handleSheduleByRegion(itemValue)
          }
          mode="dropdown"
          style={{ fontSize: 18 }}
          itemStyle={{ fontSize: 30 }}
        >
          <Picker.Item key="1" label="Select Region" value="1" />
          {regions?.map((region) => (
            <Picker.Item
              key={region.regionNo}
              label={region.name}
              value={region.regionNo}
            />
          ))}
        </Picker>
      </View>

      <View className="w-full px-4">
        {schedules?.length > 0 ? (
          <>
            <SheduleDay
              shedules={schedules}
              day="Monday"
              className="bg-blue-100"
            />
            <SheduleDay
              shedules={schedules}
              day="Tuesday"
              className="bg-blue-200"
            />
            <SheduleDay
              shedules={schedules}
              day="Wednesday"
              className="bg-blue-300"
            />
            <SheduleDay
              shedules={schedules}
              day="Thursday"
              className="bg-blue-400"
            />
            <SheduleDay
              shedules={schedules}
              day="Friday"
              className="bg-blue-500"
            />
            <SheduleDay shedules={schedules} day="Saturday" />
            <SheduleDay shedules={schedules} day="Sunday" />
          </>
        ) : (
          <View>
            <Text>No shedule for this region123</Text>
          </View>
        )}
      </View>
    </View>
  );
}
