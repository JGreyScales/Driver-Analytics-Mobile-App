// src/screens/HomeScreen.js
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage"; 
import { GLOBAL_STYLES, COLORS, FONTS } from "../styles/GlobalStyles";
import { withAuthLoading } from "../utils/LoadingClass";



function HomeScreen({navigation}) {
  const [username, setUsername] = useState(""); 
  

  // fetch stored username from AsyncStorage
  useEffect(() => {
    const loadUsername = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem("username");
        if (storedUsername) {
          setUsername(storedUsername);
          console.log("Loaded username:", storedUsername);
        }
      } catch (error) {
        console.error("Error loading username:", error);
      }
    };

    loadUsername();
  }, []);

   const goToTrackJourney = () => {
      navigation.navigate("Journey");
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
      {/* Title */}
      <Text
        style={[
          GLOBAL_STYLES.title,
          { fontSize: 50, fontWeight: "700", marginBottom: 5 },
        ]}>Welcome</Text>

      {/* Username */}
      <Text
        style={[
          GLOBAL_STYLES.subtitle,
          { fontSize: 25, color: "#030403ff", marginBottom: 150 },
        ]}>{username || "Username"}</Text>

      {/* Buttons */}
      <TouchableOpacity 
        onPress={goToTrackJourney}
        style={[
          GLOBAL_STYLES.button,
          { backgroundColor: COLORS.primary || "#5CC76D", width: "100%", marginBottom: 90 },
        ]}
      ><Text style={[
        GLOBAL_STYLES.buttonText,
        { fontSize: 20, fontWeight: "600", color: "#fff" },
      ]}
      >Track a Journey</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          GLOBAL_STYLES.button,
          { backgroundColor: COLORS.primary || "#5CC76D", width: "100%", marginBottom: 100 },
        ]}
      >
        <Text style={[
        GLOBAL_STYLES.buttonText,
        { fontSize: 20, fontWeight: "600", color: "#fff" },
      ]}
        >Journey Score</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          GLOBAL_STYLES.button,
          { backgroundColor: COLORS.primary || "#5CC76D", width: "100%"},
        ]}
      >
        <Text style={[
        GLOBAL_STYLES.buttonText,
        { fontSize: 20, fontWeight: "600", color: "#fff" },
      ]}
        >Global Score</Text>
      </TouchableOpacity>
    </View>
  );
}
export { HomeScreen }; 
export default withAuthLoading(HomeScreen);