// src/utils/JourneyDataUploader.js
import SessionManager from "./SessionManager";
import FetchHelper from "./fetchHelper";
import { Alert } from "react-native";

/**
 * Validates journey data before uploading to API
 * Returns { isValid: boolean, error: string }
 */
function validateJourneyData(data) {
  const { tripDuration, incidentCount, averageSpeed, maxSpeed } = data;

  // Check if all required fields exist
  if (tripDuration === undefined || incidentCount === undefined || 
      averageSpeed === undefined || maxSpeed === undefined) {
    return { isValid: false, error: "Missing required journey data fields" };
  }

  // Validate tripDuration (must be positive integer)
  if (!Number.isInteger(tripDuration) || tripDuration <= 0) {
    return { isValid: false, error: `Invalid trip duration: ${tripDuration}. Must be a positive number.` };
  }

  // Validate incidentCount (must be non-negative integer)
  if (!Number.isInteger(incidentCount) || incidentCount < 0) {
    return { isValid: false, error: `Invalid incident count: ${incidentCount}. Must be 0 or greater.` };
  }

  // Validate averageSpeed (must be positive integer, > 0)
  if (!Number.isInteger(averageSpeed) || averageSpeed <= 0) {
    return { isValid: false, error: `Invalid average speed: ${averageSpeed}. Must be greater than 0.` };
  }

  // Validate maxSpeed (must be positive integer, > 0)
  if (!Number.isInteger(maxSpeed) || maxSpeed <= 0) {
    return { isValid: false, error: `Invalid max speed: ${maxSpeed}. Must be greater than 0.` };
  }

  // Validate maxSpeed >= averageSpeed
  if (maxSpeed < averageSpeed) {
    return { isValid: false, error: `Max speed (${maxSpeed}) cannot be less than average speed (${averageSpeed}).` };
  }

  return { isValid: true, error: null };
}

export async function uploadDriverScore(journeyData) {
  try {
    // Validate journey data before proceeding
    const validation = validateJourneyData(journeyData);
    if (!validation.isValid) {
      console.error("❌ Journey data validation failed:", validation.error);
      Alert.alert(
        "Invalid Journey Data",
        `Cannot upload trip: ${validation.error}\n\nThe trip was too short or didn't collect enough data.`,
        [{ text: "OK" }]
      );
      return false;
    }

    const manager = new SessionManager("JWT_TOKEN");
    const token = await manager.getToken();

    if (!token) {
      console.warn("JWT token not found — skipping upload.");
      return false;
    }

    // Construct request body
    const requestBody = {
      tripDuration: journeyData.tripDuration,
      incidentCount: journeyData.incidentCount,
      averageSpeed: journeyData.averageSpeed,
      maxSpeed: journeyData.maxSpeed,
    };
    const requestHeaders = {
      "Content-Type": "application/json",
      Authorization: token,
    }

    console.log("Uploading journey data:", requestBody);

    // Send PUT request to backend
    const response = await FetchHelper.makeRequest(
      "driving/score",
      "PUT",
      requestHeaders,
      requestBody
    )


    const resText = await response.text();
    console.log("🧾 Raw backend response:", resText);

    let json;
    try {
      json = JSON.parse(resText);
    } catch {
      json = null; 
    }

    if (response.ok) {
      console.log("Journey data uploaded successfully:", json || '(cant parse json)');
      return true;
    } else {
      console.error("Upload failed:", json || resText);
      return false;
    }
  } catch (err) {
    console.error("Error uploading driver data:", err);
    return false;
  }
}
