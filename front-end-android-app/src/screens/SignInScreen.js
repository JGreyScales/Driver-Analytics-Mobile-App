// src/screens/SignInScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { GLOBAL_STYLES } from "../styles/GlobalStyles";

export default function SignInScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = () => {
    // Minimal placeholder behaviour: log and navigate if navigation exists
    console.log("Sign in attempt", { username, password });
    Alert.alert("Sign In", "This is a placeholder sign in.");
    if (navigation && navigation.navigate) {
      navigation.navigate("Home");
    }
  };

  const goToSignUp = () => {
    if (navigation && navigation.navigate) navigation.navigate("SignUp");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={GLOBAL_STYLES.container}
    >
      <View style={{ alignItems: "center", marginBottom: 20 }}>
        <Text style={GLOBAL_STYLES.title}>Sign In</Text>
        <Text style={GLOBAL_STYLES.subtitle}>Welcome Back</Text>
      </View>

      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={GLOBAL_STYLES.input}
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={GLOBAL_STYLES.input}
        secureTextEntry
      />

      <TouchableOpacity style={GLOBAL_STYLES.button} onPress={handleSignIn}>
        <Text style={GLOBAL_STYLES.buttonText}>Sign In</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={goToSignUp}>
        <Text style={[GLOBAL_STYLES.linkText, { marginTop: 12 }]}>Don't have an account? Sign up</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}
