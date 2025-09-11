import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import {
  Animated,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export default function Rating({ starRating, setStarRating }) {
  //const [starRating, setStarRating] = useState(null);
  const animatedButtonScale = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(animatedButtonScale, {
      toValue: 1.5,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(animatedButtonScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const animatedScaleStyle = {
    transform: [{ scale: animatedButtonScale }],
  };

  return (
    <View className="w-full items-center justify-center p-5">
      {/* <Text className="font-bold text-xl mb-5">
        {starRating ? `${starRating}*` : "Tap to rate"}
      </Text> */}
      <View className="flex-row">
        <TouchableWithoutFeedback
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={() => setStarRating(1)}
        >
          <Animated.View style={animatedScaleStyle}>
            <MaterialIcons
              name={starRating >= 1 ? "star" : "star-border"}
              size={32}
              style={
                starRating >= 1 ? styles.starSelected : styles.starUnselected
              }
            />
          </Animated.View>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={() => setStarRating(2)}
        >
          <Animated.View style={animatedScaleStyle}>
            <MaterialIcons
              name={starRating >= 2 ? "star" : "star-border"}
              size={32}
              style={
                starRating >= 2 ? styles.starSelected : styles.starUnselected
              }
            />
          </Animated.View>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={() => setStarRating(3)}
        >
          <Animated.View style={animatedScaleStyle}>
            <MaterialIcons
              name={starRating >= 3 ? "star" : "star-border"}
              size={32}
              style={
                starRating >= 3 ? styles.starSelected : styles.starUnselected
              }
            />
          </Animated.View>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={() => setStarRating(4)}
        >
          <Animated.View style={animatedScaleStyle}>
            <MaterialIcons
              name={starRating >= 4 ? "star" : "star-border"}
              size={32}
              style={
                starRating >= 4 ? styles.starSelected : styles.starUnselected
              }
            />
          </Animated.View>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={() => setStarRating(5)}
        >
          <Animated.View style={animatedScaleStyle}>
            <MaterialIcons
              name={starRating >= 5 ? "star" : "star-border"}
              size={32}
              style={
                starRating >= 5 ? styles.starSelected : styles.starUnselected
              }
            />
          </Animated.View>
        </TouchableWithoutFeedback>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  starUnselected: {
    color: "#aaa",
  },
  starSelected: {
    color: "#ffb300",
  },
});
