// src/screens/JourneyTrackScreen.js
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GLOBAL_STYLES, COLORS, FONTS } from "../styles/GlobalStyles";
import * as TaskManager from "expo-task-manager";
import { LOCATION_TASK_NAME } from "../background/locationTask";
import { LoadingAuthManager, withAuthLoading } from "../utils/LoadingClass";
import HomeScreen from "./HomeScreen";

function JourneyTrackScreen({navigation}) {
  const [tracking, setTracking] = useState(false);
  const [locationSubscription, setLocationSubscription] = useState(null);
  const auth = new LoadingAuthManager(navigation);

  const startTracking = async () => {
    console.log("🚀 Start Journey Pressed");

    let { status } = await Location.requestForegroundPermissionsAsync();
    console.log("Foreground Status:", status);

    if (status !== "granted") {
      Alert.alert("Permission required", "Enable location access to start tracking.");
      return;
    }

    console.log("Foreground Permission Granted");
    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Highest,
        timeInterval: 3000,
        distanceInterval: 1,
      },
      (loc) => {
        const { latitude, longitude, speed } = loc.coords;
        console.log(`📍 LAT: ${latitude}, LNG: ${longitude}, SPEED: ${speed}`);
      }
    );

    setLocationSubscription(subscription);

    try {
      const bgPermission = await Location.requestBackgroundPermissionsAsync();
      console.log("Background permission:", bgPermission.status);

      if (bgPermission.status === "granted") {
        const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
        if (!isRegistered) {
          await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
            accuracy: Location.Accuracy.Highest,
            timeInterval: 5000,
            distanceInterval: 1,
            foregroundService: {
              notificationTitle: "Driver Motion",
              notificationBody: "Background location tracking is active",
            },
          });
          console.log("Background location updates started");
        } else {
          console.log("Background task already registered");
        }
      } else {
        console.log("Background permission not granted; background tracking will not run");
      }
    } catch (err) {
      console.error("Error starting background updates:", err);
    }

    setTracking(true);
  };

  const stopTracking = () => {
    console.log("🛑 Stop Pressed");
    if (locationSubscription) {
      locationSubscription.remove();
      setLocationSubscription(null);
      console.log("🛑 Tracking Stopped");
    }

    (async () => {
      try {
        const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
        if (isRegistered) {
          await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
          console.log("Background location updates stopped");
        }
      } catch (err) {
        console.error("Error stopping background updates:", err);
      }
    })();

    setTracking(false);
  };

  const goToHome = () => {
      navigation.navigate("Home");
  };
  return (
    <View
      style={[
        GLOBAL_STYLES.container,
        {
          justifyContent: "flex-start",
          alignItems: "center",
          paddingTop: 30,
          marginBottom: 50,
        },
      ]}
    >
      {/* Title */}
      <Text
        style={[
            GLOBAL_STYLES.title,
            { fontSize: 40, fontWeight: "800", marginBottom: 330 },
            ]}>Track Your Journey</Text>

      {/* Button */}
      <TouchableOpacity
        onPress={tracking ? stopTracking : startTracking}
        style={[
          GLOBAL_STYLES.button,
          { backgroundColor: tracking ? "#960800ff" : ( COLORS.primary ||"#5CC76D"),
             width: "80%", marginBottom: 280},
        ]}
      >
        <Text style={[
        GLOBAL_STYLES.buttonText,
        { fontSize: 40, fontWeight: "700", color: "#fff" },
      ]}
        >{tracking ? "End Journey" : "Start Journey"}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={goToHome}
        style={[
          GLOBAL_STYLES.button,
          { backgroundColor: "#114f1bff", width: "40%" },
          ]}
      >
        <Text style={[
        GLOBAL_STYLES.buttonText,
        { fontSize: 20, fontWeight: "700", color: "#fff" },
      ]}
        >Back</Text>
      </TouchableOpacity>
    </View>
  )
}
export default withAuthLoading(JourneyTrackScreen);