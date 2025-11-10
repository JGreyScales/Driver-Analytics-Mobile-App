// src/screens/HomeScreen.js
import React, { useState, useEffect } from "react";
import { Modal, View, Text, TouchableOpacity, Alert } from "react-native";
import { GLOBAL_STYLES, COLORS, FONTS } from "../styles/GlobalStyles";
import { withAuthLoading } from "../utils/LoadingClass";
import SessionManager from "../utils/SessionManager";
import Ionicons from 'react-native-vector-icons/Ionicons';
import UserSignout from '../utils/userSignout'
import FetchHelper from "../utils/fetchHelper";


function HomeScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [displaySettings, setDisplaySettings] = useState(false)
  const [downloadUsage, setDownloadUsage] = useState(0)
  const [uploadUsage, setUploadUsage] = useState(0)

  useEffect(() => {

    async function fetchUsername() {

      if (username === "") {
        const usernameManager = new SessionManager('Username')
        // try to fetch the username from cache
        const username = await usernameManager.getToken()
        if (username !== null) {
          setUsername(username)
        } else {
          // otherwise fetch the username from the api
          const manager = new SessionManager('JWT_TOKEN');
          const token = await manager.getToken();

          const requestHeaders = {
            'Content-Type': 'application/json',
            'Authorization': token
          }

          const response = await FetchHelper.makeRequest("http://10.0.2.2:3000/user/",
            "GET",
            requestHeaders
          )

          if (response.ok) {
            const data = await response.json();
            usernameManager.setToken(data.data.username)
            setUsername(data.data.username);
          } else {
            Alert.alert("Error", "Failed to fetch username");
          }
        }
      }
    }
    fetchUsername();
  }, []);  // Empty dependency array so it runs only once when the component mounts


  const goToTrackJourney = () => {
    navigation.navigate("Journey");
  };

  const openSettingsModal = () => {
    async function getUsageStats() {
      setDownloadUsage(await FetchHelper.fetchDownloadUsage())
      setUploadUsage(await FetchHelper.fetchUploadUsage())
    }
    getUsageStats()
    setDisplaySettings(true)
  }

  const signoutUser = async () => {
    await UserSignout.signoutUser(navigation)
  }

  const clearCache = () => {
    FetchHelper.clearCache()
    setDownloadUsage(0)
    setUploadUsage(0)
  }


  return (
    <View
      style={[
        GLOBAL_STYLES.container,
        {
          justifyContent: "flex-start",
          alignItems: "center",
          paddingTop: 30,
        },
      ]}
    >
      {/* Settings Icon - Cogwheel in the Top Right */}
      <TouchableOpacity
        onPress={openSettingsModal}
        style={{
          position: 'absolute',
          top: 30,
          right: 20,
          zIndex: 1000,
        }}
      >
        <Ionicons name="settings" size={30} color={COLORS.primary || "#5CC76D"} />
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={displaySettings}
        onRequestClose={() => setDisplaySettings(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)', // semi-transparent background
          }}
        >
          <View
            style={{
              width: '80%',
              backgroundColor: '#fff', // modal background
              padding: 20,
              borderRadius: 10,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Sign Out Button */}
            <TouchableOpacity
              onPress={() => signoutUser()}
              style={[
                GLOBAL_STYLES.button,
                { backgroundColor: COLORS.primary || "#5CC76D", width: "100%", marginBottom: 20 },
              ]}
            >
              <Text style={[GLOBAL_STYLES.buttonText, { fontSize: 20, fontWeight: "600", color: "#fff" }]}>
                Sign Out
              </Text>
            </TouchableOpacity>
            {/* clear cache button */}
            <TouchableOpacity
              onPress={() => clearCache()}
              style={[
                GLOBAL_STYLES.button,
                { backgroundColor: COLORS.primary || "#5CC76D", width: "100%", marginBottom: 20 },
              ]}
            >
              <Text style={[GLOBAL_STYLES.buttonText, { fontSize: 20, fontWeight: "600", color: "#fff" }]}>
                Clear Usage Cache
              </Text>
            </TouchableOpacity>
            {/* Close Button */}
            <TouchableOpacity
              onPress={() => setDisplaySettings(false)}
              style={[
                GLOBAL_STYLES.button,
                { backgroundColor: COLORS.primary || "#5CC76D", width: "100%", marginBottom: 20 },
              ]}
            >
              <Text style={[GLOBAL_STYLES.buttonText, { fontSize: 20, fontWeight: "600", color: "#fff" }]}>
                Close
              </Text>
            </TouchableOpacity>
            <Text>Download Usage: {(Number(downloadUsage / (1024 * 1024))).toFixed(2)}MB</Text>
            <Text>Upload Usage: {(Number(uploadUsage / (1024 * 1024)).toFixed(2))}MB</Text>
          </View>
        </View>
      </Modal>

      {/* Title */}
      <Text
        style={[
          GLOBAL_STYLES.title,
          { fontSize: 50, fontWeight: "700", marginBottom: 5 },
        ]}
      >
        Welcome
      </Text>

      {/* Username */}
      <Text
        style={[
          GLOBAL_STYLES.subtitle,
          { fontSize: 25, color: "#030403ff", marginBottom: 150 },
        ]}
      >
        {username || "Username"}
      </Text>

      {/* Buttons */}
      <TouchableOpacity
        onPress={goToTrackJourney}
        style={[
          GLOBAL_STYLES.button,
          { backgroundColor: COLORS.primary || "#5CC76D", width: "100%", marginBottom: 90 },
        ]}
      >
        <Text style={[GLOBAL_STYLES.buttonText, { fontSize: 20, fontWeight: "600", color: "#fff" }]}>
          Track a Journey
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          GLOBAL_STYLES.button,
          { backgroundColor: COLORS.primary || "#5CC76D", width: "100%", marginBottom: 100 },
        ]}
      >
        <Text style={[GLOBAL_STYLES.buttonText, { fontSize: 20, fontWeight: "600", color: "#fff" }]}>
          Journey Score
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          GLOBAL_STYLES.button,
          { backgroundColor: COLORS.primary || "#5CC76D", width: "100%" },
        ]}
      >
        <Text style={[GLOBAL_STYLES.buttonText, { fontSize: 20, fontWeight: "600", color: "#fff" }]}>
          Global Score
        </Text>
      </TouchableOpacity>

    </View>
  );
}
export { HomeScreen };
export default withAuthLoading(HomeScreen);