// src/screens/SignUpScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";

export default function SignUpScreen() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [fadeAnim] = useState(new Animated.Value(0));

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Animate screen fade-in
  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();
  }, []);

  const validate = () => {
    let newErrors = {};
    if (!email) newErrors.email = "Email is required.";
    else if (!emailRegex.test(email)) newErrors.email = "Enter a valid email address.";

    if (!username) newErrors.username = "Username is required.";

    if (!password) newErrors.password = "Password is required.";
    else if (password.length < 8) newErrors.password = "Password must be at least 8 characters.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = () => {
    if (validate()) {
      alert("✅ Account created successfully (mock).");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
        <Text style={styles.title}>Create Account</Text>

        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={[styles.input, errors.email && styles.errorInput]}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

        <TextInput
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          style={[styles.input, errors.username && styles.errorInput]}
          autoCapitalize="none"
        />
        {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}

        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          style={[styles.input, errors.password && styles.errorInput]}
          secureTextEntry
        />
        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#E8F0FE",
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1a73e8",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
    backgroundColor: "#fafafa",
    fontSize: 16,
  },
  errorInput: {
    borderColor: "#e53935",
  },
  errorText: {
    color: "#e53935",
    marginBottom: 8,
    marginLeft: 4,
    fontSize: 13,
  },
  button: {
    backgroundColor: "#1a73e8",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});