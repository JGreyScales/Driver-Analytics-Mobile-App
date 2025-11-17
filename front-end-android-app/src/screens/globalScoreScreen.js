import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { GLOBAL_STYLES, COLORS } from "../styles/GlobalStyles";
import FetchHelper from "../utils/fetchHelper";
import { withAuthLoading } from "../utils/LoadingClass";
import SessionManager from "../utils/SessionManager.js";

function globalScoreScreen({navigation}) { 
    const [loading, setLoading] = useState(true); 
    const [scoreData, setScoreData] = useState(0); 
    const [comparativeScore, setComparativeScore] = useState(0); 
    const [tripCount, setTripCount] = useState(0); 

    useEffect(() => { 
        const fetchScores = async() => { 
            try { 
                const manager = new SessionManager('JWT_TOKEN'); 
                const token = await manager.getToken();
                const header =                     {
                  "Content-Type": "application/json", 
                  "Authorization": token, 
                }

                const response = await FetchHelper.makeRequest("http://10.0.2.2:3000/user", 
                    "GET", 
                    header
                );

                if(response.ok){
                  const data = await response.json(); 
                  const userData = data.data; 
                  const safeScore = userData.score ?? 0; 
                  const safeTripCount = userData.tripCount ?? 0; 

                  setScoreData(safeScore);
                  setTripCount(safeTripCount)
                const compResponse = await FetchHelper.makeRequest("http://10.0.2.2:3000/driving/comparativeScore",
                  "GET",
                  header
                )

                console.log(compResponse)

                if (compResponse.ok){
                  const compData = await compResponse.json(); 
                  const safeComp = compData.data.comparativeScore ?? 0
                  setComparativeScore(safeComp)
                }
                }else{
                  console.log("response not ok: ", data); 
                  Alert.alert("Failed to fetch user data", data.message); 
                }
              }catch(err){
                console.error("Error fetching score:", err);
                setError("Error fetching scores"); 
              }finally{ 
                setLoading(false);
              }
            }

            fetchScores(); 
          },
          []);

    
    const goToHome = () => {
        navigation.navigate("Home");
    };

    if(loading){ 
        return( 
            <View style={GLOBAL_STYLES.centered}>
              <ActivityIndicator size="large" color="#007BFF" />
              <Text>Loading scores...</Text>
            </View>
        );
  }

  return (
    <View style={GLOBAL_STYLES.container}>

      <View
        style={{
          backgroundColor: "#f2f2f2",
          padding: 20,
          borderRadius: 16,
          width: "90%",
          marginBottom: 40,
          elevation: 2,
        }}
      >
        <Text
          style={{ fontSize: 18, fontWeight: "700", color: COLORS.primary }}
        >
          📊 Your score
        </Text>
        <Text style={{ fontSize: 16 }}>Score: {scoreData} / 255</Text>
        <Text style={{ fontSize: 16 }}>In top {comparativeScore}% of drivers</Text>
        <Text style={{ fontSize: 16 }}>Trips:{tripCount}</Text>
      </View>

    {/* Back Button */}
    <TouchableOpacity
        onPress={goToHome}
        style={[
          GLOBAL_STYLES.button,
          { backgroundColor: "#114f1bff", width: "40%" },
        ]}
      >
        <Text
          style={[
            GLOBAL_STYLES.buttonText,
            { fontSize: 20, fontWeight: "700", color: "#fff" },
          ]}
        >
          Back
        </Text>
      </TouchableOpacity>
        </View>
  );
};
export default withAuthLoading(globalScoreScreen);