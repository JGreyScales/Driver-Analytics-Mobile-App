import * as TaskManager from "expo-task-manager";

// Use a single exported task name constant and ensure the defineTask uses the same name
export const LOCATION_TASK_NAME = "LOCATION_TASK";

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.log("🚨 Task Error:", error);
    return;
  }

  console.log("📍 Background Update Triggered");

  const { locations } = data;
  const { latitude, longitude } = locations[0].coords;

  console.log("📌 Location:", latitude, longitude);
});