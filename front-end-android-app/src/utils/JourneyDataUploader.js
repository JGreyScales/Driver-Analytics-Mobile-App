// src/utils/JourneyDataUploader.js
import SessionManager from "./SessionManager";
import FetchHelper from "./fetchHelper";
import Toast from 'react-native-toast-message';

export async function uploadDriverScore(journeyData) {
  try {
    const manager = new SessionManager("JWT_TOKEN");
    const token = await manager.getToken();

    if (!token) {
      Toast.show({
        type: 'error',
        text1: 'Authentication Required',
        text2: 'Please log in to upload journey data',
        position: 'bottom',
        visibilityTime: 4000,
      });
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

    // Check if response exists (network might be down)
    if (!response) {
      Toast.show({
        type: 'error',
        text1: 'Upload Failed',
        text2: 'No internet connection',
        position: 'bottom',
        visibilityTime: 4000,
      });
      // Only log warning, not error (prevents red screen)
      console.warn("No response from server - likely network issue");
      return false;
    }

    const resText = await response.text();
    console.log("🧾 Raw backend response:", resText);

    let json;
    try {
      json = JSON.parse(resText);
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Upload Failed',
        text2: 'Could not upload drive score - server error',
        position: 'bottom',
        visibilityTime: 4000,
      });
      // Only log warning, not error (prevents red screen)
      console.warn("Failed to parse server response:", resText);
      return false;
    }

    if (response.ok) {
      Toast.show({
        type: 'success',
        text1: 'Journey Uploaded! 🎉',
        text2: 'Your driving score has been updated',
        position: 'bottom',
        visibilityTime: 3000,
      });
      console.log("Journey data uploaded successfully:", json);
      return true;
    } else {
      // Handle specific error codes with user-friendly messages
      let errorMessage = 'Could not upload drive score';
      
      if (response.status === 401) {
        errorMessage = 'Session expired - please log in again';
      } else if (response.status === 400) {
        errorMessage = json?.message || 'Invalid journey data';
      } else if (response.status === 500) {
        errorMessage = 'Server error - please try again later';
      } else {
        errorMessage = json?.message || 'Unknown error occurred';
      }

      Toast.show({
        type: 'error',
        text1: 'Upload Failed',
        text2: errorMessage,
        position: 'bottom',
        visibilityTime: 4000,
      });
      
      // Only log warning, not error (prevents red screen)
      console.warn("Upload failed with status", response.status, ":", json);
      return false;
    }
  } catch (err) {
    // Network errors or unexpected issues
    let errorMessage = 'Could not upload drive score';
    
    if (err.message?.includes('Network') || err.message?.includes('network')) {
      errorMessage = 'No internet connection';
    } else if (err.message?.includes('timeout')) {
      errorMessage = 'Request timed out - please try again';
    } else if (err.message?.includes('text')) {
      errorMessage = 'No internet connection';
    } else {
      errorMessage = 'An unexpected error occurred';
    }

    Toast.show({
      type: 'error',
      text1: 'Upload Failed',
      text2: errorMessage,
      position: 'bottom',
      visibilityTime: 4000,
    });
    
    // Only log warning, not error (prevents red screen)
    console.warn("Error uploading driver data:", err.message || err);
    return false;
  }
}
