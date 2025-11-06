import React, { useState, useContext } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { GLOBAL_STYLES } from "../styles/GlobalStyles";
import { LocationContext } from "../utils/LocationContext";

export default function HomeScreen() {
  const [tracking, setTracking] = useState(false);
  const locationSubscription = useContext(LocationContext); // <- global instance

  const startTracking = async () => {
    console.log("🚀 Start Journey Pressed");
    await locationSubscription.startSubscription();
    setTracking(true);
  };

  const stopTracking = async () => {
    console.log("🛑 Stop Pressed");
    await locationSubscription.stopSubscription();
    setTracking(false);
  };

  return (
    <View style={GLOBAL_STYLES.container}>
      <Text style={GLOBAL_STYLES.title}>Driver Motion</Text>
      <Text style={GLOBAL_STYLES.subtitle}>Welcome Driver</Text>

      {!tracking ? (
        <TouchableOpacity style={GLOBAL_STYLES.button} onPress={startTracking}>
          <Text style={GLOBAL_STYLES.buttonText}>Start Journey</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={GLOBAL_STYLES.button} onPress={stopTracking}>
          <Text style={GLOBAL_STYLES.buttonText}>Stop Journey</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
