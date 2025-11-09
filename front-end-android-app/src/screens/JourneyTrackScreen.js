import React, { useState, useContext, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { GLOBAL_STYLES, COLORS } from "../styles/GlobalStyles";
import { LoadingAuthManager, withAuthLoading } from "../utils/LoadingClass";
import { LocationContext } from "../utils/LocationContext";
import { uploadDriverScore } from "../utils/JourneyDataUploader";

function JourneyTrackScreen({ navigation }) {
  const locationSubscription = useContext(LocationContext);
  const isTrackingRef = useRef(locationSubscription.isTracking);
  const [isTracking, setIsTracking] = useState(locationSubscription.isTracking);

  // Live statistics
  const [duration, setDuration] = useState(0);
  const [maxSpeed, setMaxSpeed] = useState(0);
  const [avgSpeed, setAvgSpeed] = useState(0);
  const [incidents, setIncidents] = useState(0);

  // Timer
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef(null);

  const auth = new LoadingAuthManager(navigation);

  // Sync tracking state
  useEffect(() => {
    if (locationSubscription.isTracking !== isTrackingRef.current) {
      setIsTracking(locationSubscription.isTracking);
      isTrackingRef.current = locationSubscription.isTracking;
    }
  }, [locationSubscription.isTracking]);

  // Live updates for stats every 1 second
  useEffect(() => {
    const interval = setInterval(() => {
      setMaxSpeed(Math.floor(locationSubscription.maxSpeed || 0));
      setAvgSpeed(Math.floor(locationSubscription.avgSpeed || 0));
      setIncidents(locationSubscription.incidentCount || 0);
    }, 1000);
    return () => clearInterval(interval);
  }, [locationSubscription]);

  // 🕒 Timer control
  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // 🚀 Start journey
  const startTracking = async () => {
    console.log("🚀 Start Journey Pressed");
    await locationSubscription.startSubscription();
    setIsTracking(true);
    setElapsedTime(0);
    startTimer();
  };

  // 🛑 Stop journey
  const stopTracking = async () => {
    console.log("🛑 Stop Pressed");
    await locationSubscription.stopSubscription();
    setIsTracking(false);
    stopTimer();

    await handleEndJourney();
  };

  // 📤 Upload data
  async function handleEndJourney() {
    console.log("Ending Journey and uploading data...");

    const journeyData = {
      tripDuration: Math.floor(elapsedTime / 60), // duration in minutes
      incidentCount: locationSubscription.incidentCount,
      averageSpeed: Math.floor(locationSubscription.avgSpeed),
      maxSpeed: Math.floor(locationSubscription.maxSpeed),
    };

    console.log("Journey data to upload:", journeyData);

    const success = await uploadDriverScore(journeyData);
    console.log(success ? "Journey data uploaded successfully" : "Failed to upload journey data");
  }

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
        },
      ]}
    >
      <Text
        style={[
          GLOBAL_STYLES.title,
          { fontSize: 32, fontWeight: "800", marginBottom: 20 },
        ]}
      >
        Track Your Journey
      </Text>

      {/* Live Stats Section */}
      <View
        style={{
          backgroundColor: "#f2f2f2",
          padding: 20,
          borderRadius: 16,
          width: "90%",
          marginBottom: 40,
          elevation: 2,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "700", color: COLORS.primary }}>
          📊 Live Statistics
        </Text>

        <Text style={{ fontSize: 16, marginTop: 10 }}>
          🕒 Duration: {formatTime(elapsedTime)}
        </Text>
        <Text style={{ fontSize: 16 }}>
          🚀 Max Speed: {maxSpeed} km/h
        </Text>
        <Text style={{ fontSize: 16 }}>
          📈 Avg Speed: {avgSpeed} km/h
        </Text>
        <Text style={{ fontSize: 16 }}>
          ⚠️ Incidents: {incidents}
        </Text>
      </View>

      {/* Start/Stop Button */}
      <TouchableOpacity
        onPress={isTracking ? stopTracking : startTracking}
        style={[
          GLOBAL_STYLES.button,
          {
            backgroundColor: isTracking ? "#960800ff" : COLORS.primary,
            width: "80%",
            marginBottom: 40,
          },
        ]}
      >
        <Text
          style={[
            GLOBAL_STYLES.buttonText,
            { fontSize: 28, fontWeight: "700", color: "#fff" },
          ]}
        >
          {isTracking ? "End Journey" : "Start Journey"}
        </Text>
      </TouchableOpacity>

      {/* Back Button */}
      <TouchableOpacity
        onPress={goToHome}
        style={[
          GLOBAL_STYLES.button,
          { backgroundColor: "#114f1bff", width: "40%" },
        ]}
      >
        <Text
          style={[
            GLOBAL_STYLES.buttonText,
            { fontSize: 20, fontWeight: "700", color: "#fff" },
          ]}
        >
          Back
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default withAuthLoading(JourneyTrackScreen);