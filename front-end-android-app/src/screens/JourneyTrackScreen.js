// src/screens/JourneyTrackScreen.js
import React, { useState, useContext } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { GLOBAL_STYLES, COLORS, FONTS } from "../styles/GlobalStyles";
import { LoadingAuthManager, withAuthLoading } from "../utils/LoadingClass";
import { LocationContext } from "../utils/LocationContext";

function JourneyTrackScreen({navigation}) {
  const [tracking, setTracking] = useState(false);
  const locationSubscription = useContext(LocationContext); // <- global instance
  const auth = new LoadingAuthManager(navigation);

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