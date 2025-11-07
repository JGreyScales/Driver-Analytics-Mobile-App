// src/screens/HomeScreen.js
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GLOBAL_STYLES, COLORS, FONTS } from "../styles/GlobalStyles";
import { withAuthLoading } from "../utils/LoadingClass";
import SessionManager from "../utils/SessionManager";



function HomeScreen({ navigation }) {
  const [username, setUsername] = useState("");


useEffect(() => {
  async function fetchUsername() {
    if (username === "") {
      const manager = new SessionManager('JWT_TOKEN');
      const token = await manager.getToken();
      
      const response = await fetch("http://10.0.2.2:3000/user/", {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsername(data.data.username);
      } else {
        Alert.alert("Error", "Failed to fetch username");
      }
    }
  }
  fetchUsername();
}, []);  // Empty dependency array so it runs only once when the component mounts


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
          { backgroundColor: COLORS.primary || "#5CC76D", width: "100%" },
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