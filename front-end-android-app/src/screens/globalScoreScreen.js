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
          "http://10.0.2.2:3000/user",
          "GET",
          header
        );

        if (response.ok) {
          const data = await response.json();
          const userData = data.data;
          setScoreData(userData.score ?? 0);
          setTripCount(userData.tripCount ?? 0);

          const compResponse = await FetchHelper.makeRequest(
            "http://10.0.2.2:3000/driving/comparativeScore",
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
          `http://10.0.2.2:3000/driving/history`,
          "GET",
          header,
          body
        );
        const data = await response.json();
        console.log(data)
        if (response.ok) {
          const data = await response.json();
          setDisplayableTrips(data.data || []);
        } else if (response.status === 404) {
          setDisplayableTrips([]);
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
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📊 Your score</Text>
        <Text>Score: {scoreData} / 255</Text>
        <Text>In top {comparativeScore}% of drivers</Text>
        <Text>Trips: {tripCount}</Text>
      </View>

      {/* Trip History */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🛣️ Trip History</Text>
        {displayableTrips.length === 0 ? (
          <Text style={{ textAlign: "center", marginVertical: 20 }}>Nothing to show here</Text>
        ) : (
          <FlatList
            data={displayableTrips}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.tripCard}>
                <Text style={styles.tripCardTitle}>Trip #{item.tripID}</Text>
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
        <View style={styles.buttonRow}>
          <TouchableOpacity
            onPress={() => modifyHistoryPage(-1)}
            style={[GLOBAL_STYLES.button, styles.navButton]}
          >
            <Text style={styles.buttonText}>Previous</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => modifyHistoryPage(1)}
            style={[GLOBAL_STYLES.button, styles.navButton]}
          >
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Back Button */}
      <TouchableOpacity
        onPress={goToHome}
        style={[GLOBAL_STYLES.button, { backgroundColor: COLORS.primary, width: "40%" }]}
      >
        <Text style={styles.buttonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#f2f2f2",
    padding: 20,
    borderRadius: 16,
    width: "90%",
    marginBottom: 20,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 10,
  },
  tripCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 1,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  navButton: {
    width: "48%",
    backgroundColor: "#114f1bff",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },
});

export default withAuthLoading(GlobalScoreScreen);
