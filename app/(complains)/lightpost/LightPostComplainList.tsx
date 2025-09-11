import { complainMap } from "../../../complainMaps";

import {
  addLightPostComplainAsync,
  GetActiveListPostComplainsByMe,
  getNearLightPosts,
} from "@/api/lightPostAction";
import { useAuthStore } from "@/stores/authStore";
import { createRef, useEffect, useState } from "react";
import { Alert, Modal, StyleSheet, View } from "react-native";
import GooglePlacesTextInput, {
  Place,
} from "react-native-google-places-textinput";
import MapView, { Marker } from "react-native-maps";
import { Button, IconButton, Text } from "react-native-paper";
import LightPostContainer from "./LightPostContainer";
import SelectList from "./SelectList";

const initialRegion = {
  latitude: 7.028372283362622,
  longitude: 80.02045957272463,
  latitudeDelta: 0.043,
  longitudeDelta: 0.034,
};

export default function LightPostComplainList() {
  const [modalVisible, setModalVisible] = useState(false);
  const [addingComplain, setAddingComplain] = useState(false);

  const [selectedPostNo, setSelectedPostNo] = useState(null);
  const [myComplains, setMyComplains] = useState([]);
  const mapRef = createRef<MapView>();
  const { userInfo } = useAuthStore();

  const [nearPoles, setNearPoles] = useState([
    {
      latitude: 7.02740345296692,
      longitude: 80.01386152129754,
      lightPostNumber: "LP001",
    },
    {
      latitude: 7.027062550953933,
      longitude: 80.02092091266162,
      lightPostNumber: "LP002",
    },
  ]);

  function markerModelHandler(postNo: string, isModel: boolean) {
    setModalVisible(isModel);
    setSelectedPostNo(postNo);
  }

  async function addComplain(id) {
    console.log("add", id);
    try {
      const result = await addLightPostComplainAsync({
        lightPostNumber: selectedPostNo,
        clientId: userInfo.sub,
        subject: id,
        detail: "",
      });
      if (!result.isSuccess) {
        console.error("Failed to add light post complain:", result.message);
        return;
      }
      console.log("Light post complain added successfully:", result.data);

      await fetchActiveComplainsByMe();
      setAddingComplain(false);
    } catch (error) {
      console.error("Error adding light post complain:", error);
      // Toast error is already shown by fetchWrapper
    }
  }

  async function fetchActiveComplainsByMe() {
    try {
      const activeList = await GetActiveListPostComplainsByMe(selectedPostNo);
      if (!activeList.isSuccess) {
        console.error("Failed to fetch active complains:", activeList.message);
        setMyComplains([]);
        return;
      }
      console.log("my list", activeList.data, selectedPostNo);
      setMyComplains(activeList.data || []);
    } catch (error) {
      console.error("Error fetching active complains:", error);
      setMyComplains([]);
      // Toast error is already shown by fetchWrapper
    }
  }

  const handlePlaceSelect = async (place: Place) => {
    console.log("Selected place:", place);
    try {
      const poleList = await getNearLightPosts(place);
      if (!poleList.isSuccess) {
        console.error("Failed to get near light posts:", poleList.message);
        setNearPoles([]);
        return;
      }
      console.log("Near light posts data:", poleList.data);
      setNearPoles(poleList.data || []);
      mapRef.current.animateToRegion({
        latitude: place.details?.location?.latitude,
        longitude: place.details?.location?.longitude,
        latitudeDelta: 0.044,
        longitudeDelta: 0.034,
      });
    } catch (error) {
      console.error("Error getting near light posts:", error);
      setNearPoles([]);
      // Toast error is already shown by fetchWrapper
    }
  };

  useEffect(() => {
    if (selectedPostNo) {
      fetchActiveComplainsByMe();
    }
  }, [selectedPostNo]);

  return (
    <View className="flex-1 gap-2   p-1">
      <View>
        <GooglePlacesTextInput
          apiKey="AIzaSyBO2E_KAoN9H3bmeXlS9Np20qGmtlg-qbc"
          onPlaceSelect={handlePlaceSelect}
          fetchDetails={true}
        />
      </View>
      <MapView style={styles.map} initialRegion={initialRegion} ref={mapRef}>
        {nearPoles?.map((pole) => {
          return (
            <Marker
              onPress={() => markerModelHandler(pole.lightPostNumber, true)}
              key={pole.lightPostNumber}
              title="Picked Location"
              coordinate={{
                latitude: pole.latitude,
                longitude: pole.longitude,
              }}
            />
          );
        })}
      </MapView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert("Modal has been closed.");
          setModalVisible(!modalVisible);
        }}
      >
        {addingComplain ? (
          <View className="flex-1 justify-center items-center bg-[#57cc99]/80">
            <View className="w-4/5 py-6 px-4 bg-[#f6fff8] rounded-2xl items-center elevation-sm gap-4 relative">
              <Text className="font-bold text-2xl text-[#22577a] self-start">
                Add Complain
              </Text>
              <View className="flex w-full mt-3 gap-2">
                <SelectList
                  list={complainMap}
                  onPress={addComplain}
                  myList={myComplains}
                />
              </View>

              <View
                style={{ position: "absolute", top: 2, right: 8, zIndex: 10 }}
              >
                <IconButton
                  icon="close"
                  className="bg-[#57cc99]"
                  size={18}
                  mode="contained"
                  onPress={() => setAddingComplain((prev) => !prev)}
                />
              </View>
            </View>
          </View>
        ) : (
          <View className="flex-1 justify-center items-center bg-[#57cc99]/80">
            <View className="w-4/5 p-4 bg-[#f6fff8] rounded-2xl items-center elevation-sm gap-4 relative">
              <Text className="font-bold text-2xl text-[#22577a] self-start">
                Light Post Details
              </Text>
              <View className="w-full">
                {selectedPostNo && (
                  <LightPostContainer postNo={selectedPostNo} />
                )}
              </View>

              <Button
                icon="plus"
                mode="contained"
                onPress={() => setAddingComplain(true)}
                style={{
                  backgroundColor: "#38a3a5",
                  borderRadius: 8,
                  paddingHorizontal: 16,
                  paddingVertical: 6,
                }}
                labelStyle={{
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: 16,
                }}
              >
                Complain
              </Button>

              {/* <IconButton
                icon="close"
                iconColor={MD3Colors.primary10}
                size={30}
                mode="contained"
                onPress={() => setModalVisible(!modalVisible)}
              /> */}
              <View
                style={{ position: "absolute", top: 2, right: 8, zIndex: 10 }}
              >
                <IconButton
                  icon="close"
                  className="bg-[#57cc99]"
                  size={18}
                  mode="contained"
                  onPress={() => setModalVisible(!modalVisible)}
                />
              </View>
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    width: "100%",
    height: "100%",
  },
});
