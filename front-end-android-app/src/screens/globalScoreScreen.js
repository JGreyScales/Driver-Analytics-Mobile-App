import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, FlatList, StyleSheet } from "react-native";
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
            "comparativeScore",
            "GET",
            header
          );
          
          if (compResponse.ok) {
            const compData = await compResponse.json();
            setComparativeScore(compData.data.comparativeScore ?? 0);
          }
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
      <View style={GLOBAL_STYLES.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text>Loading scores...</Text>
      </View>
    );
  }

  return (
    <View style={GLOBAL_STYLES.container}>
      {/* Score Card */}
      <View style={GLOBAL_STYLES.card}>
        <Text style={GLOBAL_STYLES.cardTitle}>📊 Your score</Text>
        <Text>Score: {scoreData} / 255</Text>
        <Text>In top {comparativeScore}% of drivers</Text>
        <Text>Trips: {tripCount}</Text>
      </View>

      {/* Trip History */}
      <View style={GLOBAL_STYLES.card}>
        <Text style={GLOBAL_STYLES.cardTitle}>🛣️ Trip History</Text>
        {displayableTrips.length === 0 ? (
          <Text style={{ textAlign: "center", marginVertical: 20 }}>Loading...</Text>
        ) : (
          <FlatList
            data={displayableTrips}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={GLOBAL_STYLES.tripCard}>
                <Text style={GLOBAL_STYLES.tripCardTitle}>Trip #{tripCount - historyPage}</Text>
                <Text>Score: {item.tripScore} / 255</Text>
                <Text>Duration: {item.tripDuration} Min</Text>
                <Text>Incidents: {item.incidentCount}</Text>
                <Text>Avg Speed: {item.averageSpeed} km/h</Text>
                <Text>Max Speed: {item.maxSpeed} km/h</Text>
              </View>
            )}
          />
        )}

        {/* Previous / Next Buttons in the same row */}
        <View style={GLOBAL_STYLES.buttonRow}>
          <TouchableOpacity
            onPress={() => modifyHistoryPage(-1)}
            style={[GLOBAL_STYLES.button, GLOBAL_STYLES.navButton]}
          >
            <Text style={GLOBAL_STYLES.buttonText}>Previous</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => modifyHistoryPage(1)}
            style={[GLOBAL_STYLES.button, GLOBAL_STYLES.navButton]}
          >
            <Text style={GLOBAL_STYLES.buttonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Back Button */}
      <TouchableOpacity
        onPress={goToHome}
        style={[GLOBAL_STYLES.button, { backgroundColor: COLORS.primary, width: "40%" }]}
      >
        <Text style={GLOBAL_STYLES.buttonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

export default withAuthLoading(GlobalScoreScreen);
