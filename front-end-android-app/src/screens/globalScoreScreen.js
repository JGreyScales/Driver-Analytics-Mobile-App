import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, FlatList, StyleSheet, Animated } from "react-native";
import { GLOBAL_STYLES, COLORS } from "../styles/GlobalStyles";
import FetchHelper from "../utils/fetchHelper";
import { withAuthLoading } from "../utils/LoadingClass";
import SessionManager from "../utils/SessionManager.js";

function GlobalScoreScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [scoreData, setScoreData] = useState(0);
  const [comparativeScore, setComparativeScore] = useState(0);
  const [tripCount, setTripCount] = useState(0);
  const [historyPage, setHistoryPage] = useState(0);
  const [displayableTrips, setDisplayableTrips] = useState([]);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scoreAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const manager = new SessionManager("JWT_TOKEN");
        const token = await manager.getToken();
        const header = {
          "Content-Type": "application/json",
          Authorization: token,
        };

        const response = await FetchHelper.makeRequest(
          "user",
          "GET",
          header
        );

        if (response.ok) {
          const data = await response.json();
          const userData = data.data;
          setScoreData(userData.score ?? 0);
          setTripCount(userData.tripCount ?? 0);

          const compResponse = await FetchHelper.makeRequest(
            "driving/comparativeScore",
            "GET",
            header
          );
          
          if (compResponse.ok) {
            const compData = await compResponse.json();
            setComparativeScore(compData.data.comparativeScore ?? 0);
          }
          
          Animated.spring(scoreAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 20,
            friction: 7,
          }).start();
        } else {
          Alert.alert("Failed to fetch user data", data.message);
        }
      } catch (err) {
        console.error("Error fetching score:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const manager = new SessionManager("JWT_TOKEN");
        const token = await manager.getToken();
        const header = {
          "Content-Type": "application/json",
          Authorization: token,
        };

        const body = {
          offset: historyPage
        }

        const response = await FetchHelper.makeRequest(
          `driving/history`,
          "POST",
          header,
          body
        );
        if (response.ok) {
          const data = await response.json();
          setDisplayableTrips(data.data || []);
        } else if (response.status === 404) {
          modifyHistoryPage(-1)
        }
      } catch (e) {
        console.log(e);
      }
    };

    fetchHistory();
  }, [historyPage]);

  const modifyHistoryPage = (modifyAmount) => {
    if (historyPage + modifyAmount < 0) return;
    setHistoryPage(historyPage + modifyAmount);
    setDisplayableTrips([]);
  };

  const goToHome = () => navigation.navigate("Home");

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading your stats...</Text>
      </View>
    );
  }

  const scorePercentage = (scoreData / 255) * 100;
  const getScoreColor = () => {
    if (scorePercentage >= 80) return '#4CAF50';
    if (scorePercentage >= 60) return '#FFC107';
    return '#EF5350';
  };

  return (
    <View style={styles.container}>
      <Animated.ScrollView 
        style={{ flex: 1, width: '100%' }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        opacity={fadeAnim}
      >
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Performance</Text>
          <Text style={styles.headerSubtitle}>Track your driving excellence</Text>
        </View>

        {/* Main Score Card */}
        <Animated.View 
          style={[
            styles.scoreCard,
            {
              transform: [{ scale: scoreAnim }]
            }
          ]}
        >
          <View style={styles.scoreCircle}>
            <Text style={[styles.scoreValue, { color: getScoreColor() }]}>{scoreData}</Text>
            <Text style={styles.scoreMax}>/ 255</Text>
          </View>
          <Text style={styles.scoreLabel}>Overall Score</Text>
          
          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${scorePercentage}%`, backgroundColor: getScoreColor() }]} />
          </View>
        </Animated.View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Text style={styles.statIcon}>🏆</Text>
            </View>
            <Text style={styles.statValue}>Top {comparativeScore}%</Text>
            <Text style={styles.statLabel}>Global Ranking</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Text style={styles.statIcon}>🛣️</Text>
            </View>
            <Text style={styles.statValue}>{tripCount}</Text>
            <Text style={styles.statLabel}>Total Trips</Text>
          </View>
        </View>

        {/* Trip History Section */}
        <View style={styles.historySection}>
          <View style={styles.historySectionHeader}>
            <Text style={styles.historySectionTitle}>📜 Trip History</Text>
            <Text style={styles.historySectionSubtitle}>Page {historyPage + 1}</Text>
          </View>

          {displayableTrips.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Loading trips...</Text>
            </View>
          ) : (
            <FlatList
              data={displayableTrips}
              keyExtractor={(item, index) => index.toString()}
              scrollEnabled={false}
              renderItem={({ item, index }) => (
                <View style={styles.tripCard}>
                  <View style={styles.tripCardHeader}>
                    <Text style={styles.tripNumber}>Trip #{tripCount - historyPage - index}</Text>
                    <View style={[styles.tripScoreBadge, { backgroundColor: getScoreColor() }]}>
                      <Text style={styles.tripScoreText}>{item.tripScore}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.tripDetailsGrid}>
                    <View style={styles.tripDetail}>
                      <Text style={styles.tripDetailLabel}>Duration</Text>
                      <Text style={styles.tripDetailValue}>{item.tripDuration} min</Text>
                    </View>
                    <View style={styles.tripDetail}>
                      <Text style={styles.tripDetailLabel}>Avg Speed</Text>
                      <Text style={styles.tripDetailValue}>{item.averageSpeed} km/h</Text>
                    </View>
                  </View>
                  
                  <View style={styles.tripDetailsGrid}>
                    <View style={styles.tripDetail}>
                      <Text style={styles.tripDetailLabel}>Max Speed</Text>
                      <Text style={styles.tripDetailValue}>{item.maxSpeed} km/h</Text>
                    </View>
                    <View style={styles.tripDetail}>
                      <Text style={styles.tripDetailLabel}>Incidents</Text>
                      <Text style={[styles.tripDetailValue, { color: item.incidentCount > 0 ? '#EF5350' : '#4CAF50' }]}>
                        {item.incidentCount}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            />
          )}

          {/* Navigation Buttons */}
          <View style={styles.navigationButtons}>
            <TouchableOpacity
              onPress={() => modifyHistoryPage(-1)}
              style={[styles.navButton, styles.prevButton]}
              activeOpacity={0.7}
            >
              <Text style={styles.navButtonText}>← Previous</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => modifyHistoryPage(1)}
              style={[styles.navButton, styles.nextButton]}
              activeOpacity={0.7}
            >
              <Text style={styles.navButtonText}>Next →</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Back Button */}
        <TouchableOpacity
          onPress={goToHome}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>← Back to Home</Text>
        </TouchableOpacity>

      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 30,
  },
  header: {
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  
  // Score Card
  scoreCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 32,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  scoreCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 8,
    borderColor: '#E8E8E8',
  },
  scoreValue: {
    fontSize: 64,
    fontWeight: '800',
    letterSpacing: -2,
  },
  scoreMax: {
    fontSize: 20,
    fontWeight: '600',
    color: '#999',
    marginTop: -8,
  },
  scoreLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: '#E8E8E8',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F0F9F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    fontSize: 28,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
    textAlign: 'center',
  },

  // History Section
  historySection: {
    marginBottom: 24,
  },
  historySectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  historySectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  historySectionSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
  },

  // Trip Card
  tripCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tripCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tripNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  tripScoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tripScoreText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  tripDetailsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  tripDetail: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
  },
  tripDetailLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  tripDetailValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },

  // Navigation
  navigationButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  navButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  prevButton: {
    backgroundColor: '#FFFFFF',
  },
  nextButton: {
    backgroundColor: COLORS.primary,
  },
  navButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },

  // Back Button
  backButton: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
});

export default withAuthLoading(GlobalScoreScreen);
