// src/utils/JourneyDataUploader.js
import SessionManager from "./SessionManager";
import FetchHelper from "./fetchHelper";

export async function uploadDriverScore(journeyData) {
  try {
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
