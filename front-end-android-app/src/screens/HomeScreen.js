import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import * as Location from "expo-location";
import { GLOBAL_STYLES } from "../styles/GlobalStyles";
import { LOCATION_TASK_NAME } from "../background/locationTask";

export default function HomeScreen() {

  const startJourney = async () => {
  console.log("🚀 Start Journey Pressed");

  // 1️⃣ Foreground permission
  const fg = await Location.requestForegroundPermissionsAsync();
  if (fg.status !== "granted") {
    Alert.alert("Permission required", "Turn on location to start journey.");
    return;
  }
  console.log("✅ Foreground Permission Granted");

  // 2️⃣ Android requires FINE location before background
  if (Platform.OS === "android") {
    const bg = await Location.requestBackgroundPermissionsAsync();
    if (bg.status !== "granted") {
      Alert.alert("Background Tracking Required", "Please allow background location.");
      return;
    }
    console.log("✅ Background Permission Granted");
  }

  Alert.alert("✅ Tracking enabled", "We will now monitor your journey.");

  // 3️⃣ Start background task
  await Location.startLocationUpdatesAsync("LOCATION_TASK", {
    accuracy: Location.Accuracy.Highest,
    timeInterval: 2000, // 2 seconds
    distanceInterval: 0, // remove 5 meters restriction for now
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: "Drive Tracking Active",
      notificationBody: "Your journey is being recorded.",
    },
  });

  console.log("🎯 Background Location Task Started");
};

  const stopJourney = async () => {
    const has = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
    if (has) {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      Alert.alert("🛑 Journey Stopped", "Background tracking stopped.");
    }
  };

  return (
    <View style={GLOBAL_STYLES.container}>
      <Text style={GLOBAL_STYLES.title}>Home</Text>

      <TouchableOpacity style={GLOBAL_STYLES.button} onPress={startJourney}>
        <Text style={GLOBAL_STYLES.buttonText}>Start Journey</Text>
      </TouchableOpacity>

      <TouchableOpacity style={GLOBAL_STYLES.button} onPress={stopJourney}>
        <Text style={GLOBAL_STYLES.buttonText}>Stop Journey</Text>
      </TouchableOpacity>
    </View>
  );
}