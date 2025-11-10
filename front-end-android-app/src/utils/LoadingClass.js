// src/utils/AuthManager.js
import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Text, Alert } from "react-native";
import SessionManager from "../utils/SessionManager";
import UserSignout from "./userSignout";
import FetchHelper from "./fetchHelper";
import { GLOBAL_STYLES, COLORS } from "../styles/GlobalStyles";


export class LoadingAuthManager {
  constructor(navigation) {
    this.navigation = navigation;
  }
  async authenticate() {
    try {
      const manager = new SessionManager("JWT_TOKEN");
      const token = await manager.getToken();

      if (!token) {
        console.log("No token found — redirecting to SignIn");
        await UserSignout.signoutUser(this.navigation)
        return false;
      }
      const requestHeaders = {
        Authorization: token,//send token in headers
        "Content-Type": "application/json",
      }
      const response = await FetchHelper.makeRequest("http://10.0.2.2:3000/auth/",
        "GET",
        requestHeaders
      ) 

      if (response.ok) {
        console.log("Token verified");
        return true;
      } else {
        console.log("Invalid or expired token");
        await UserSignout.signoutUser(this.navigation)
        return false;
      }
    } catch (err) {
      console.error("Error verifying token:", err);
      Alert.alert("Error", "Network or token error occurred");
      await UserSignout.signoutUser(this.navigation)
      return false;
    }
  }
}
export function withAuthLoading(WrappedComponent) {
  return function AuthenticatedScreen(props) {
    const [loading, setLoading] = useState(true);
    const auth = new LoadingAuthManager(props.navigation);

    useEffect(() => {
      const checkAuth = async () => {
        await auth.authenticate();//authenticate user before showing screen
        setLoading(false);
      };
      checkAuth();
    }, []);

    if (loading) {
      return (
        <View
          style={[
            GLOBAL_STYLES.container,
            { justifyContent: "center", alignItems: "center" },
          ]}
        >
          <ActivityIndicator size="large" color={COLORS.primary || "#5CC76D"} />
          <Text style={{ marginTop: 15, fontSize: 18 }}>Authenticating...</Text>
        </View>
      );
    }

    return <WrappedComponent {...props} />;
  };
}
