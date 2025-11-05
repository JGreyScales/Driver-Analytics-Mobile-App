import * as TaskManager from "expo-task-manager";

export const LOCATION_TASK_NAME = "background-location-task";

TaskManager.defineTask("LOCATION_TASK", async ({ data, error }) => {
  if (error) {
    console.log("🚨 Task Error:", error);
    return;
  }

  console.log("📍 Background Update Triggered");

  const { locations } = data;
  const { latitude, longitude } = locations[0].coords;

  console.log("📌 Location:", latitude, longitude);
});