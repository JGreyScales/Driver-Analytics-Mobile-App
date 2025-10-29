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
  Image,
} from "react-native";
import { GLOBAL_STYLES, COLORS } from "../styles/GlobalStyles";

export default function SignUpScreen() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [fadeAnim] = useState(new Animated.Value(0));

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Animate fade-in
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

  const handleSignUp = () => {
    if (validate()) {
      alert("Account created successfully (mock).");
    }
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
        />
        {errors.password && (
          <Text style={GLOBAL_STYLES.errorText}>{errors.password}</Text>
        )}

        {/* Sign Up Button */}
        <TouchableOpacity style={GLOBAL_STYLES.button} onPress={handleSignUp}>
          <Text style={GLOBAL_STYLES.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        {/* Footer */}
        <Text style={[GLOBAL_STYLES.linkText, { marginTop: 12 }]}>
          Already have an account? Login
        </Text>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}