// App.js
import React from "react";
import { LocationProvider } from "./src/utils/LocationContext";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SignInScreen from "./src/screens/SignInScreen";
import SignUpScreen from "./src/screens/SignUpScreen";
import HomeScreen from "./src/screens/HomeScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <LocationProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="SignIn" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="SignIn" component={SignInScreen} options={{ title: 'Sign In' }} />
          <Stack.Screen name="SignUp" component={SignUpScreen} options={{ title: 'Sign Up' }} />
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </LocationProvider>
  );
}