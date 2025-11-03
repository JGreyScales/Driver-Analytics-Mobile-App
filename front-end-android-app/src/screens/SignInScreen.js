// src/screens/SignInScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import { GLOBAL_STYLES, COLORS } from "../styles/GlobalStyles";

export default function SignInScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();
  }, []);

  /*soft checks for user and pass to make sure user inputs make sense*/
  const validate = () => {
    let newErrors = {};
    if (!username) {
      newErrors.username = "Username is required.";
    }else if(username.length < 3) { 
      newErrors.username = "Username must be atleast 3 characters long.";
    }
    if (!password){
      newErrors.password = "Password is required.";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    try{///post request to backedn
      const response = await fetch("http://10.0.2.2:3000/user/", {
        method: 'POST', //authenticate
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({username, password}), 
      })
      const data = await response.json();//analyze resposne

      //checks for success or failure based on response
      if(response.ok){
        alert("Successful Login", data.message);
      }else{ 
        alert("Failed Login", data.message); 
      }
    }catch(err) { 
      console.error(err); 
      alert("Could not connect, Error:", err); 
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
          <Text style={GLOBAL_STYLES.title}>Login</Text>
          <Text style={GLOBAL_STYLES.subtitle}>Welcome Back Driver</Text>
        </View>

        {/* Input Fields */}
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
          secureTextEntry={true}
        />
        {errors.password && (
          <Text style={GLOBAL_STYLES.errorText}>{errors.password}</Text>
        )}

        {/* Login Button */}
        <TouchableOpacity style={GLOBAL_STYLES.button} onPress={handleLogin}>
          <Text style={GLOBAL_STYLES.buttonText}>Login</Text>
        </TouchableOpacity>

        {/* Footer */}
        {/*navigates to signup screen*/}
        <Text style={[GLOBAL_STYLES.linkText, { marginTop: 12 }]}> Don't have an account? Sign Up</Text>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}