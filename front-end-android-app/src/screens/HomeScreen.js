// src/screens/HomeScreen.js
import React, { useState, useEffect, useRef } from "react";
import { Modal, View, Text, TouchableOpacity, Alert, StyleSheet, Animated, ScrollView } from "react-native";
import { GLOBAL_STYLES, COLORS, FONTS } from "../styles/GlobalStyles";
import { withAuthLoading } from "../utils/LoadingClass";
import SessionManager from "../utils/SessionManager";
import Ionicons from 'react-native-vector-icons/Ionicons';
import UserSignout from '../utils/userSignout'
import FetchHelper from "../utils/fetchHelper";
import globalScoreScreen from "./globalScoreScreen";


function HomeScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [displaySettings, setDisplaySettings] = useState(false)
  const [downloadUsage, setDownloadUsage] = useState(0)
  const [uploadUsage, setUploadUsage] = useState(0)
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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

          const response = await FetchHelper.makeRequest(
            "user/",
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
  }, []);


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
  const showPopup = async () => {
    Alert.alert(
      "Confirm Action",
      "Are you sure you want to continue?",
      [
        {
          text: "NO",
          onPress: () => console.log("User pressed NO"),
          style: "cancel"
        },
        {
          text: "OK",
          onPress: async () => {
            const manager = new SessionManager('JWT_TOKEN');
            const token = await manager.getToken();

            const requestHeaders = {
              'Content-Type': 'application/json',
              'Authorization': token
            }

            FetchHelper.makeRequest('http://10.0.2.2:3000/user/', 'DELETE', requestHeaders) // dont await, not needed
            UserSignout.signoutUser(navigation)
          }
        }
      ],
      { cancelable: true }
    );
  };


return (
  <View style={styles.container}>
    {/* Settings Icon */}
    <TouchableOpacity
      onPress={openSettingsModal}
      style={styles.settingsButton}
      activeOpacity={0.7}
    >
      <Ionicons name="settings-outline" size={28} color="#666" />
    </TouchableOpacity>

    {/* Settings Modal */}
    <Modal
      animationType="slide"
      transparent={true}
      visible={displaySettings}
      onRequestClose={() => setDisplaySettings(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Settings</Text>
          
          {/* Usage Stats */}
          <View style={styles.usageStats}>
            <View style={styles.usageStat}>
              <Text style={styles.usageLabel}>Download</Text>
              <Text style={styles.usageValue}>{(Number(downloadUsage / (1024 * 1024))).toFixed(2)} MB</Text>
            </View>
            <View style={styles.usageStat}>
              <Text style={styles.usageLabel}>Upload</Text>
              <Text style={styles.usageValue}>{(Number(uploadUsage / (1024 * 1024)).toFixed(2))} MB</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            onPress={() => clearCache()}
            style={[styles.modalButton, styles.modalButtonSecondary]}
          >
            <Ionicons name="trash-outline" size={20} color={COLORS.primary} />
            <Text style={[styles.modalButtonText, { color: COLORS.primary }]}>Clear Cache</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => signoutUser()}
            style={[styles.modalButton, styles.modalButtonPrimary]}
          >
            <Ionicons name="log-out-outline" size={20} color="#FFF" />
            <Text style={styles.modalButtonText}>Sign Out</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={async () => await showPopup()}
            style={[styles.modalButton, styles.modalButtonDanger]}
          >
            <Ionicons name="warning-outline" size={20} color="#FFF" />
            <Text style={styles.modalButtonText}>Delete Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setDisplaySettings(false)}
            style={styles.modalCloseButton}
          >
            <Text style={styles.modalCloseText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>

    {/* Main Content */}
    <Animated.View 
      style={[
        styles.contentWrapper,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeLabel}>Welcome back,</Text>
        <Text style={styles.username}>{username || "Driver"}</Text>
        <Text style={styles.welcomeSubtitle}>Ready to track your journey?</Text>
      </View>

      {/* Navigation Cards */}
      <View style={styles.cardsContainer}>
        {/* Track Journey Card */}
        <TouchableOpacity
          onPress={goToTrackJourney}
          style={styles.primaryCard}
          activeOpacity={0.9}
        >
          <View style={styles.cardIconContainer}>
            <Ionicons name="navigate" size={40} color="#FFF" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.primaryCardTitle}>Track Journey</Text>
            <Text style={styles.primaryCardSubtitle}>Start monitoring your drive</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>

        {/* Global Score Card */}
        <TouchableOpacity
          onPress={() => navigation.navigate("globalScore")}
          style={styles.secondaryCard}
          activeOpacity={0.9}
        >
          <View style={styles.secondaryCardIcon}>
            <Ionicons name="trophy" size={32} color={COLORS.primary} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.secondaryCardTitle}>Global Score</Text>
            <Text style={styles.secondaryCardSubtitle}>View your stats & ranking</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>
      </View>

      {/* Quick Stats Preview (Optional) */}
      <View style={styles.quickStatsContainer}>
        <View style={styles.quickStat}>
          <Ionicons name="speedometer-outline" size={24} color={COLORS.primary} />
          <Text style={styles.quickStatLabel}>Ready to drive</Text>
        </View>
      </View>

    </Animated.View>
  </View>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  settingsButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1000,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 20,
    textAlign: 'center',
  },
  usageStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  usageStat: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  usageLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  usageValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
    gap: 8,
  },
  modalButtonPrimary: {
    backgroundColor: COLORS.primary,
  },
  modalButtonSecondary: {
    backgroundColor: '#F0F9F1',
  },
  modalButtonDanger: {
    backgroundColor: '#EF5350',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalCloseButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
  },

  // Content
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 120,
  },
  welcomeSection: {
    marginBottom: 40,
  },
  welcomeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#888',
    marginBottom: 4,
  },
  username: {
    fontSize: 40,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 8,
    letterSpacing: -1,
  },
  welcomeSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#999',
  },

  // Cards
  cardsContainer: {
    gap: 16,
    marginBottom: 32,
  },
  primaryCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  cardIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  primaryCardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  primaryCardSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
  },
  
  secondaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  secondaryCardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F0F9F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  secondaryCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  secondaryCardSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#999',
  },

  // Quick Stats
  quickStatsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quickStatLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
});
export { HomeScreen };
export default withAuthLoading(HomeScreen);