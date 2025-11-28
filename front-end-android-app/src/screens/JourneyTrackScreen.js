import React, { useState, useContext, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GLOBAL_STYLES, COLORS } from "../styles/GlobalStyles";
import { LoadingAuthManager, withAuthLoading } from "../utils/LoadingClass";
import { LocationContext } from "../utils/LocationContext";
import { uploadDriverScore } from "../utils/JourneyDataUploader";

function JourneyTrackScreen({ navigation }) {
  const locationSubscription = useContext(LocationContext);
  const isTrackingRef = useRef(locationSubscription.isTracking);
  const [isTracking, setIsTracking] = useState(locationSubscription.isTracking);

  // Live statistics
  const [duration, setDuration] = useState(0);
  const [maxSpeed, setMaxSpeed] = useState(0);
  const [avgSpeed, setAvgSpeed] = useState(0);
  const [incidents, setIncidents] = useState(0);
 
  // Timer
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef(null);

  //button cooldown
  const [coolDown, setCoolDown]= useState(false);
  const [coolDownTime, setCoolDownTime] = useState(0);
  
  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const auth = new LoadingAuthManager(navigation);

  // Pulse animation for tracking button
  useEffect(() => {
    if (isTracking) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isTracking]);

  // Fade in animation on mount
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // 🔁 Sync tracking state
  useEffect(() => {
    if (locationSubscription.isTracking !== isTrackingRef.current) {
      setIsTracking(locationSubscription.isTracking);
      isTrackingRef.current = locationSubscription.isTracking;
    }
  }, [locationSubscription.isTracking]);

  // 📈 Update live stats every second
  useEffect(() => {
    const interval = setInterval(() => {
      setMaxSpeed(Math.floor(locationSubscription.maxSpeed || 0));
      setAvgSpeed(Math.floor(locationSubscription.avgSpeed || 0));
      setIncidents(locationSubscription.incidentCount || 0);
    }, 1000);
    return () => clearInterval(interval);
  }, [locationSubscription]);

  // 🕒 Timer control
  const startTimer = () => {
    if (timerRef.current) return; // prevent duplicates
    timerRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // 🚀 Start journey
  const startTracking = async () => {
    console.log("🚀 Start Journey Pressed");
    await locationSubscription.startSubscription();
    setIsTracking(true);

    const startTime = Date.now();
    await AsyncStorage.setItem("tripStartTime", startTime.toString());

    if(coolDown){
      return;
    }
    startCoolDown();

    setElapsedTime(0);
    startTimer();
  };

  // 🛑 Stop journey
  const stopTracking = async () => {
    console.log("🛑 Stop Pressed");
    await locationSubscription.stopSubscription();
    setIsTracking(false);
    stopTimer();
    if(coolDown){
      return;
    }

    startCoolDown();
    await AsyncStorage.removeItem("tripStartTime");
    await handleEndJourney();
  };

  // 📤 Upload data
  async function handleEndJourney() {
    console.log("Ending Journey and uploading data...");

    const journeyData = {
      tripDuration: locationSubscription.tripDuration, // use getter that ensures > 0
      incidentCount: locationSubscription.incidentCount,
      averageSpeed: locationSubscription.averageSpeed, // use getter that ensures > 0
      maxSpeed: locationSubscription.maximumSpeed, // use getter that ensures > 0
    };

    console.log("Journey data to upload:", journeyData);

    const success = await uploadDriverScore(journeyData);
    console.log(
      success
        ? "Journey data uploaded successfully"
        : "Failed to upload journey data"
    );
  }

  // 🧭 Restore timer if journey is still running
  useEffect(() => {
    const restoreTimer = async () => {
      const startTime = await AsyncStorage.getItem("tripStartTime");
      if (startTime) {
        const diffSeconds = Math.floor(
          (Date.now() - parseInt(startTime)) / 1000
        );
        setElapsedTime(diffSeconds);
        setIsTracking(true);
        startTimer();
      }
    };
    restoreTimer();
    return () => stopTimer();
  }, []);

  const goToHome = () => {
    navigation.navigate("Home");
  };

  const startCoolDown = () => {// 10 second cooldown timer (prevent DOS)
    setCoolDown(true);
    setCoolDownTime(10); // 10 seconds cooldown

    let timer = 10;

    const interval = setInterval(() => {
      timer--;
      setCoolDownTime(timer);

      if(timer <= 0) {
        clearInterval(interval);
        setCoolDown(false);
      }
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.contentWrapper, { opacity: fadeAnim }]}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Journey Tracking</Text>
          <View style={[styles.statusBadge, isTracking && styles.statusBadgeActive]}>
            <View style={[styles.statusDot, isTracking && styles.statusDotActive]} />
            <Text style={styles.statusText}>
              {isTracking ? "LIVE" : "READY"}
            </Text>
          </View>
        </View>

        {/* Timer Card - Prominent when tracking */}
        <View style={[styles.timerCard, isTracking && styles.timerCardActive]}>
          <Text style={styles.timerLabel}>Duration</Text>
          <Text style={styles.timerValue}>{formatTime(elapsedTime)}</Text>
          {isTracking && (
            <View style={styles.recordingIndicator}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>Recording...</Text>
            </View>
          )}
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {/* Max Speed */}
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Text style={styles.statIcon}>🚀</Text>
            </View>
            <Text style={styles.statLabel}>Max Speed</Text>
            <Text style={styles.statValue}>{maxSpeed}</Text>
            <Text style={styles.statUnit}>km/h</Text>
          </View>

          {/* Avg Speed */}
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Text style={styles.statIcon}>📈</Text>
            </View>
            <Text style={styles.statLabel}>Avg Speed</Text>
            <Text style={styles.statValue}>{avgSpeed}</Text>
            <Text style={styles.statUnit}>km/h</Text>
          </View>

          {/* Incidents */}
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Text style={styles.statIcon}>⚠️</Text>
            </View>
            <Text style={styles.statLabel}>Incidents</Text>
            <Text style={styles.statValue}>{incidents}</Text>
            <Text style={styles.statUnit}>events</Text>
          </View>
        </View>

        {/* Main Action Button */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
          disabled={coolDown}
            onPress={isTracking ? stopTracking : startTracking}
            style={[
              styles.mainButton,
              isTracking ? styles.stopButton : styles.startButton,
              coolDown && { opacity: 0.6 }
            ]}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.buttonIcon}>
                {isTracking ? "⏹" : "▶️"}
              </Text>
              <Text style={styles.mainButtonText}>
                {isTracking ? "End Journey" : "Start Journey"}
                {coolDown ? ` \nWait (${coolDownTime})` : ""}
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Back Button */}
        <TouchableOpacity
          onPress={goToHome}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>← Back to Home</Text>
        </TouchableOpacity>

      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8E8E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusBadgeActive: {
    backgroundColor: '#FFE8E8',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9E9E9E',
  },
  statusDotActive: {
    backgroundColor: '#EF5350',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
    letterSpacing: 0.5,
  },
  
  // Timer Card
  timerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 30,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#F0F0F0',
  },
  timerCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#FAFFF9',
  },
  timerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  timerValue: {
    fontSize: 56,
    fontWeight: '700',
    color: COLORS.primary,
    fontVariant: ['tabular-nums'],
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF5350',
  },
  recordingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EF5350',
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F9F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    fontSize: 24,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  statUnit: {
    fontSize: 11,
    fontWeight: '500',
    color: '#AAA',
  },

  // Main Button
  mainButton: {
    borderRadius: 28,
    paddingVertical: 20,
    paddingHorizontal: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 16,
  },
  startButton: {
    backgroundColor: COLORS.primary,
  },
  stopButton: {
    backgroundColor: '#EF5350',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  buttonIcon: {
    fontSize: 24,
  },
  mainButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Back Button
  backButton: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
});

export default withAuthLoading(JourneyTrackScreen);