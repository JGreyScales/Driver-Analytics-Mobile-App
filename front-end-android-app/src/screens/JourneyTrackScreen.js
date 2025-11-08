// src/screens/JourneyTrackScreen.js
import React, { useState, useContext } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { GLOBAL_STYLES, COLORS, FONTS } from "../styles/GlobalStyles";
import { LoadingAuthManager, withAuthLoading } from "../utils/LoadingClass";
import { LocationContext } from "../utils/LocationContext";
import { uploadDriverScore } from "../utils/JourneyDataUploader";

function JourneyTrackScreen({navigation}) {
  const locationSubscription = useContext(LocationContext); 
  const [isTracking, setIsTracking] = useState(locationSubscription.isTracking);
  const auth = new LoadingAuthManager(navigation);

  const startTracking = async () => {
    console.log("🚀 Start Journey Pressed");
    await locationSubscription.startSubscription();
    setIsTracking(true)
  };

  async function handleEndJourney() {
    console.log("Ending Journey and uploading data...");

  // Gather data from the location context
  const journeyData = {
    tripDuration: Math.floor(locationSubscription.tripTime || 30), 
    incidentCount: locationSubscription.incidentCount || 0,
    averageSpeed: Math.floor(locationSubscription.avgSpeed || 55),
    maxSpeed: Math.floor(locationSubscription.maxSpeed || 60),
  };

  console.log("Journey data to upload:", journeyData);

  const success = await uploadDriverScore(journeyData);
  if (success) {
    console.log("Journey data uploaded successfully");
  } else {
    console.log("Failed to upload journey data");
  }
}


  const stopTracking = async () => {
    console.log("🛑 Stop Pressed");
    await locationSubscription.stopSubscription();
    setIsTracking(false);

    await handleEndJourney();
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
        onPress={isTracking ? stopTracking : startTracking}
        style={[
          GLOBAL_STYLES.button,
          { backgroundColor: isTracking  ? "#960800ff" : ( COLORS.primary ||"#5CC76D"),
             width: "80%", marginBottom: 280},
        ]}
      >
        <Text style={[
        GLOBAL_STYLES.buttonText,
        { fontSize: 40, fontWeight: "700", color: "#fff" },
      ]}
        >{isTracking  ? "End Journey" : "Start Journey"}</Text>
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