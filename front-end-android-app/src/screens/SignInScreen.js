// src/screens/SignInScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Animated,
  Alert,
  ActivityIndicator
} from "react-native";
import { GLOBAL_STYLES, COLORS } from "../styles/GlobalStyles";
import SessionManager from "../utils/SessionManager";
import PasswordHash from "../utils/passwordHash";

export default function SignInScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [fadeAnim] = useState(new Animated.Value(0));
  const [signingIn, setSigningIn] = useState(false)

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();
  }, []);

  /*soft checks for user and pass to make sure user inputs make sense*/
  const validate = (username, password) => {
    let newErrors = {};
    if (!username) {
      newErrors.username = "Username is required.";
    } else if (username.length < 3) {
      newErrors.username = "Username must be atleast 3 characters long.";
    }
    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate(username, password)) {
      return;
    }

    setSigningIn(true)

    try {///post request to backend
      const passwordHash = PasswordHash.HashMethod(password)

      const response = await fetch("http://10.0.2.2:3000/user/", {
        method: 'POST', //authenticate
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          {
            username: username.trim(),
            passwordHash: passwordHash
          }
        ),
      });
      const data = await response.json().catch(() => ({}));//analyze response

      //checks for success or failure based on response
      if (response.ok && data.token) {
        const session = new SessionManager('JWT_TOKEN')
        await session.setToken(data.token);
        Alert.alert('Successful Login', data.message || 'Welcome Back Driver');
        navigation.navigate('Home')
      } else {
        Alert.alert('Failed Login', data.message || 'Invalid Username or Password');
      }
    } catch (error) {
      console.error('Error during login:', error.message);
      Alert.alert('Network error occurred');
    } finally {
      setSigningIn(false)
    }
  };

  const goToSignUp = () => {
    if (navigation && navigation.navigate) navigation.navigate("SignUp");
  };

  return (
    <KeyboardAvoidingView
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
        style={[GLOBAL_STYLES.input,
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
        style={GLOBAL_STYLES.input}
        secureTextEntry
        maxLength={32}
      />
      {errors.password && (
        <Text style={GLOBAL_STYLES.errorText}>{errors.password}</Text>
      )}

      <TouchableOpacity
        style={GLOBAL_STYLES.button}
        onPress={handleLogin}
        testID="loginButton"
        disabled={signingIn}
      >
        {signingIn ? (
          <ActivityIndicator size="small" color={COLORS.white} />
        ) : (
          <Text style={GLOBAL_STYLES.buttonText}>LOGIN</Text>
        )}
      </TouchableOpacity>


      <TouchableOpacity style={GLOBAL_STYLES.button} onPress={handleLogin} testID="loginButton">
        <Text style={GLOBAL_STYLES.buttonText}>LOGIN</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={goToSignUp}>
        <Text style={[GLOBAL_STYLES.linkText, { marginTop: 12 }]}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}