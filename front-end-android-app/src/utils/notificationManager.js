// src/utils/notificationManager.js
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

class NotificationManager {
  constructor() {
    this.__configureHandler();
  }

  // Configure notification handler behavior
  __configureHandler() {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  }

  // Request user permission
  async requestPermission() {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("🚫 Notification permission not granted.");
      return false;
    }

    return true;
  }

  // Trigger immediate notification
  async sendNotification(title, body) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        vibrate: [0, 250, 250, 250],
      },
      trigger: null, // immediate
    });
  }
}

export default new NotificationManager();