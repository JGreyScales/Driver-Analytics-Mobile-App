import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { GLOBAL_STYLES } from "../styles/GlobalStyles";
import FetchHelper from "../utils/fetchHelper";
import SessionManager from "../utils/SessionManager";
import { withAuthLoading } from "../utils/LoadingClass";
import AsyncStorage from '@react-native-async-storage/async-storage';

function globalScoreScreen({navigation}) { 
    const [globalScore, setGlobalScore] = useState(null); 
    const [comparativeScore, setComparativeScore] = useState(null); 
    const [loading, setLoading] = useState(true); 

    useEffect(() => { 
        const fetchScores = async() => { 
            try { 
                const manager = new SessionManager('JWT_TOKEN'); 
                const token = await manager.getToken();
                const requestHeaders = { Authorization: `Bearer ${token}` };

                const response = await FetchHelper.makeRequest("http://10.0.2.2:3000/user/", 
                    "GET", 
                    requestHeaders
                );
                console.log("from api:", response);
                if(response.ok && response.data){ 
                    setGlobalScore(response.data.globalScore); 
                    setComparativeScore(response.data.comparativeScore); 
                }else { 
                    console.log("response not ok:", response); 
                    Alert.alert("Error", "Unable to fetch user scores."); 
                }
            }catch(err){
                console.error("Error. Fetching Score: ", err); 
                Alert.alert("Network error"); 
            }finally{
                setLoading(false); 
            }
        };
        fetchScores(); 
    }, []); 

    
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
        <Text style={GLOBAL_STYLES.score}>{globalScore ?? "N/A"}</Text>
      </View>

      <View style={GLOBAL_STYLES.scoreContainer}>
        <Text style={GLOBAL_STYLES.label}>Comparative Score:</Text>
        <Text style={GLOBAL_STYLES.score}>{comparativeScore ?? "N/A"}</Text>
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