// src/screens/SignUpScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Alert,
} from "react-native";
import { GLOBAL_STYLES, COLORS } from "../styles/GlobalStyles";
import PasswordHash from "../utils/passwordHash"

export default function SignUpScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [fadeAnim] = useState(new Animated.Value(0));

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();
  }, []);

  const validate = () => {
    let newErrors = {};
    if (!email) newErrors.email = "Email is required.";
    else if (!emailRegex.test(email))
      newErrors.email = "Enter a valid email address.";

    if (!username) newErrors.username = "Username is required.";

    if (!password) newErrors.password = "Password is required.";
    else if (password.length < 8)
      newErrors.password = "Password must be at least 8 characters.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validate()) return;

    try {
      const passwordHash = PasswordHash.HashMethod(password);
      const response = await fetch("http://10.0.2.2:3000/user/", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          "username": username,
          "email": email,
          "passwordHash": passwordHash,
          // "testing":true, 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("✅ Success", data.message || "Account created successfully!");
        setEmail("");
        setUsername("");
        setPassword("");
        setErrors({});
      } else {
        Alert.alert("⚠️ Error", data.message || "Failed to create account.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      Alert.alert("❌ Network Error", "Could not connect to the server.");
    }
  };

  const goToSignIn = () => {
    if (navigation && navigation.navigate) navigation.navigate("SignIn");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={GLOBAL_STYLES.container}
    >
      <Animated.View style={{ opacity: fadeAnim }}>
        {/* Header */}
        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <Text style={GLOBAL_STYLES.title}>Sign Up</Text>
          <Text style={GLOBAL_STYLES.subtitle}>Welcome To Driver Motion</Text>
        </View>

        {/* Input Fields */}
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={[
            GLOBAL_STYLES.input,
            errors.email && { borderColor: COLORS.error },
          ]}
          autoCapitalize="none"
          keyboardType="email-address"
          maxLength={254}
        />
        {errors.email && (
          <Text style={GLOBAL_STYLES.errorText}>{errors.email}</Text>
        )}

        <TextInput
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          style={[
            GLOBAL_STYLES.input,
            errors.username && { borderColor: COLORS.error },
          ]}
          autoCapitalize="none"
          maxLength={20}
        />
        {errors.username && (
          <Text style={GLOBAL_STYLES.errorText}>{errors.username}</Text>
        )}

        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          style={[
            GLOBAL_STYLES.input,
            errors.password && { borderColor: COLORS.error },
          ]}
          secureTextEntry
          maxLength={32}
        />
        {errors.password && (
          <Text style={GLOBAL_STYLES.errorText}>{errors.password}</Text>
        )}

        {/* Sign Up Button */}
        <TouchableOpacity style={GLOBAL_STYLES.button} onPress={handleSignUp}>
          <Text style={GLOBAL_STYLES.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={goToSignIn}>
          <Text style={[GLOBAL_STYLES.linkText, { marginTop: 12 }]}>Already have an account? Sign in</Text>
        </TouchableOpacity>

      </Animated.View>
    </KeyboardAvoidingView>
  );
}