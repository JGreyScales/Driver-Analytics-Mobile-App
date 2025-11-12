import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { GLOBAL_STYLES } from "../styles/GlobalStyles";
import FetchHelper from "../utils/fetchHelper";
import { withAuthLoading } from "../utils/LoadingClass";
import SessionManager from "../utils/SessionManager.js";

function globalScoreScreen({navigation}) { 
    const [loading, setLoading] = useState(true); 
    const [scoreData, setScoreData] = useState(null); 
    const [error, setError] = useState(null);
    const [comparativeScore, setComparativeScore] = useState(null); 

    useEffect(() => { 
        const fetchScores = async() => { 
            try { 
                const manager = new SessionManager('JWT_TOKEN'); 
                const token = await manager.getToken();
                console.log("Token Retrieved:", token); 

                const response = await FetchHelper.makeRequest("http://10.0.2.2:3000/user", 
                    "GET", 
                    {
                      "Content-Type": "application/json", 
                      "Authorization": token.startsWith("Bearer") ? token: `Bearer ${token}`, 
                    }
                );
                const data = await response.json(); 
                if(response.ok && data.statusCode === 200){
                  setScoreData(data.data);
                  setComparativeScore(data.data); 
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
      <Text style={[GLOBAL_STYLES.title, {marginBottom: 50}]}>Your Scores</Text>

      <View style={GLOBAL_STYLES.scoreContainer}>
        <Text style={GLOBAL_STYLES.label}>Global Score:</Text>
        <Text style={GLOBAL_STYLES.score}>{scoreData.score ?? "N/A"}</Text>
      </View>

      <View style={GLOBAL_STYLES.scoreContainer}>
        <Text style={GLOBAL_STYLES.label}>Comparative Score:</Text>
        <Text style={GLOBAL_STYLES.score}>{comparativeScore.score ?? "N/A"}</Text>
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