// src/screens/HomeScreen.js
import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import * as Location from "expo-location";
import { GLOBAL_STYLES } from "../styles/GlobalStyles";
import * as TaskManager from 'expo-task-manager';
import { LOCATION_TASK_NAME } from "../background/locationTask";

export default function HomeScreen() {
  const [tracking, setTracking] = useState(false);
  const [locationSubscription, setLocationSubscription] = useState(null);

  const startTracking = async () => {
    console.log("🚀 Start Journey Pressed");

    let { status } = await Location.requestForegroundPermissionsAsync();
    console.log("Foreground Status:", status);

    if (status !== "granted") {
      Alert.alert("Permission required", "Enable location access to start tracking.");
      return;
    }

    console.log("✅ Foreground Permission Granted");
    // Start foreground watcher for immediate UI updates
    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Highest,
        timeInterval: 3000, // every 3 seconds
        distanceInterval: 1, // or every 1 meter
      },
      (loc) => {
        const { latitude, longitude, speed } = loc.coords;
        console.log(
          `📍 LAT: ${latitude}, LNG: ${longitude}, SPEED: ${speed}`
        );
      }
    );

    setLocationSubscription(subscription);

    // Attempt to request background permission and start background updates
    try {
      const bgPermission = await Location.requestBackgroundPermissionsAsync();
      console.log('Background permission:', bgPermission.status);

      if (bgPermission.status === 'granted') {
        const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
        if (!isRegistered) {
          await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
            accuracy: Location.Accuracy.Highest,
            timeInterval: 5000,
            distanceInterval: 1,
            // Android foreground service notification (required on Android to keep running)
            foregroundService: {
              notificationTitle: 'Driver Motion',
              notificationBody: 'Background location tracking is active',
            },
          });
          console.log('Background location updates started');
        } else {
          console.log('Background task already registered');
        }
      } else {
        console.log('Background permission not granted; background tracking will not run');
      }
    } catch (err) {
      console.error('Error starting background updates:', err);
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
    // Stop background updates if running
    (async () => {
      try {
        const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
        if (isRegistered) {
          await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
          console.log('Background location updates stopped');
        }
      } catch (err) {
        console.error('Error stopping background updates:', err);
      }
    })();

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
