// App.js
import React, { useEffect } from "react";
import { LocationProvider } from "./src/utils/LocationContext";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// 📱 Screens
import SignInScreen from "./src/screens/SignInScreen";
import SignUpScreen from "./src/screens/SignUpScreen";
import HomeScreen from "./src/screens/HomeScreen";
import JourneyTrackScreen from "./src/screens/JourneyTrackScreen";
import globalScoreScreen from "./src/screens/globalScoreScreen";

// 🔔 Notification Manager
import NotificationManager from "./src/utils/notificationManager";

const Stack = createNativeStackNavigator();

export default function App() {

  // Request permission on app start
  useEffect(() => {
    (async () => {
      await NotificationManager.requestPermission();
    })();
  }, []);

  return (
    <LocationProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="SignIn" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="SignIn" component={SignInScreen} options={{ title: 'Sign In' }} />
          <Stack.Screen name="SignUp" component={SignUpScreen} options={{ title: 'Sign Up' }} />
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
          <Stack.Screen name="globalScore" component={globalScoreScreen} options={{ title: 'Global Score' }} />
          <Stack.Screen name="Journey" component={JourneyTrackScreen} options={{ title: 'Journey' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </LocationProvider>
  );
}