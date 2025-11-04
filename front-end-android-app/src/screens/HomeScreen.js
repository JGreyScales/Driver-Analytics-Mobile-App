// src/screens/HomeScreen.js
import React from "react";
import { View, Text } from "react-native";
import { GLOBAL_STYLES } from "../styles/GlobalStyles";

export default function HomeScreen() {
  return (
    <View style={GLOBAL_STYLES.container}>
      <Text style={GLOBAL_STYLES.title}>Welcome to the home screen</Text>
    </View>
  );
}
