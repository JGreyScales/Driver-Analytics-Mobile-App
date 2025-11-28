let Location, TaskManager;

try {
  // Try to load real Expo modules (works when running in Expo runtime)
  Location = require("expo-location");
  TaskManager = require("expo-task-manager");
} catch (error) {
  // Fallback mocks when running under Jest or non-Expo environments
  console.warn("⚠️ Expo modules not loaded — using stubs for tests.");

  Location = {
    requestForegroundPermissionsAsync: async () => ({ status: "granted" }),
    requestBackgroundPermissionsAsync: async () => ({ status: "granted" }),
    hasStartedLocationUpdatesAsync: async () => false,
    stopLocationUpdatesAsync: async () => { },
    startLocationUpdatesAsync: async () => { },
    Accuracy: { Highest: "high" },
  };

  TaskManager = {
    defineTask: () => { },
    isTaskDefined: () => false,
  };
}

import NotificationManager from "./notificationManager";
import { uploadDriverScore } from "./JourneyDataUploader"

class LocationTracking {
    constructor() {
        this.subscription = null
        this.taskName = "LOCATION_TRACKING_TASK"
        this.tripStart = null
        this.tripTime = null
        this.incidentCount = 0
        this.maxSpeed = 0
        this.avgSpeed = 0
        this.dataCount = 0
        this.currentSpeed = 0
        this.prevSpeed = 0;
        this.prevTimestamp = null;
        this.maxAllowedSpeed = 110; // km/h
        this.isTracking = false

        // 🕓 Auto-stop tracking variables
        this.lastMovementTime = null; // last time movement was detected
        //this.idleStartTime = null;    // when idle started
        this.idleTimeout = 15 * 60 * 1000; // 15 minutes in ms (adjust for testing)
        this.autoStopTriggered = false; // prevent multiple stops
    }


  __tripStartTime() {
    this.tripStart = Date.now()
  }

  __tripTime() {
    this.tripTime = Date.now() - this.tripStart;
    this.tripTime = Math.round(this.tripTime / 60000);
  }

  __maxSpeed(speed_km) {
    if (this.maxSpeed == null || speed_km > this.maxSpeed) {
      this.maxSpeed = speed_km
    }
  }

  __avgSpeed(currentSpeed) {
    this.avgSpeed = ((this.avgSpeed * (this.dataCount - 1)) + Number(currentSpeed)) / this.dataCount;
  }

  // Getter property to ensure avgSpeed is always a valid integer > 0
  get averageSpeed() {
    const rounded = Math.round(this.avgSpeed);
    return rounded > 5 ? rounded : 1; // Minimum 1 to avoid API rejection
  }

  // Getter property to ensure maxSpeed is always a valid integer > 0
  get maximumSpeed() {
    const rounded = Math.round(this.maxSpeed);
    return rounded > 5 ? rounded : 1; // Minimum 1 to avoid API rejection
  }

  // Getter property to ensure tripDuration is always a valid integer > 0
  get tripDuration() {
    const rounded = Math.round(this.tripTime);
    return rounded > 0 ? rounded : 1; // Minimum 1 minute to avoid API rejection
  }

  __detectIncident(speed_km) {
    const now = Date.now();

    // Skip first reading
    if (this.prevTimestamp == null) {
      this.prevTimestamp = now;
      this.prevSpeed = speed_km;
      return;
    }

    // Calculate time difference in seconds
    const deltaTime = (now - this.prevTimestamp) / 1000;
    const deltaSpeed = speed_km - this.prevSpeed;

    // Compute acceleration (m/s²)
    const acceleration = (deltaSpeed / 3.6) / deltaTime;

    // Harsh braking (negative acceleration)
    if (acceleration < -3) { // threshold: -3 m/s²
      console.log("🛑 Incident detected: Harsh braking");
      NotificationManager.sendNotification("🛑 Harsh Braking", "Sudden stop detected!");
      this.incidentCount++;
    }

    // Rapid acceleration
    if (acceleration > 3) { // threshold: +3 m/s²
      console.log("🚀 Incident detected: Rapid acceleration");
      NotificationManager.sendNotification("🚀 Incident detected: Rapid acceleration");
      this.incidentCount++;
    }

    // Overspeeding
    if (speed_km > this.maxAllowedSpeed) {
      const now = Date.now();

      // First time overspeeding
      if (!this.overSpeedStartTime) {
        this.overSpeedStartTime = now;
        this.lastIncidentTime = now;
        this.incidentCount += 1;
        console.log("⚠️ Incident detected: Overspeeding started");
        NotificationManager.sendNotification("⚠️ Overspeeding", "You are exceeding the speed limit!");
      }
      // Still overspeeding – check if 10 min passed since last increment
      else if (now - this.lastIncidentTime >= 1000 * 1000) {
        this.incidentCount += 1;
        this.lastIncidentTime = now;
        console.log("⚠️ 10-min Overspeed Interval Reached (+1 incident)");
        NotificationManager.sendNotification("⚠️ Overspeeding", "You are still exceeding the speed limit!");
      }
    }
    else {
      // back to normal speed → reset timer
      if (this.overSpeedStartTime) {
        console.log("✅ Overspeeding stopped");
        NotificationManager.sendNotification("✅ Speed Normalized", "You are back within the speed limit.");
      }
      this.overSpeedStartTime = null;
      this.lastIncidentTime = null;
    }

    // Update for next reading
    this.prevSpeed = speed_km;
    this.prevTimestamp = now;
  }

  async checkAutoStop(currentSpeed, stopCallback) {
    if (this.isTracking) {
      const now = Date.now();

      // 1️⃣ Vehicle is moving → reset idle timer
      if (currentSpeed > 2) { // speed threshold to consider "moving"
        this.lastMovementTime = now;
        this.autoStopTriggered = false;
        return;
      }

      // 2️⃣ Vehicle is idle → check idle duration
      if (this.lastMovementTime) {
        const idleDuration = now - this.lastMovementTime;
        if (idleDuration >= this.idleTimeout && !this.autoStopTriggered) {
          this.autoStopTriggered = true;
          console.log("⏸️ Auto-stopping location tracking due to inactivity.");
          NotificationManager.sendNotification(
            "⏸️ Tracking Paused",
            "Location tracking has been auto-stopped due to inactivity."
          );
          await this.__tripTime()
          requestData = {
            tripDuration: this.tripDuration(),
            incidentCount: this.incidentCount(),
            averageSpeed: this.averageSpeed(),
            maxSpeed: this.maximumSpeed()
          }
          await uploadDriverScore(requestData)

          await stopCallback();
        }
      }

        TaskManager.defineTask(this.taskName, async ({ data, error }) => {
            if (error) {
              console.log("🚨 Task Error:", error);
              return false;
            }
                    
            const { locations } = data;
            const { latitude, longitude, speed } = locations[0].coords;
            const speed_km = Math.round(speed * 3.6); // convert m/s to km/h
            console.log(`current speed_km: ${speed_km}`);

            // Check for auto-stop condition
            await this.checkAutoStop(speed_km, this.stopSubscription.bind(this));
            if (speed_km !== 0){
            this.__maxSpeed(speed_km);
            this.dataCount += 1;
            this.__avgSpeed(speed_km);
            }
            this.__detectIncident(speed_km);


          });
        return true
    }

    return
  }

  async __locationTask() {
    if (TaskManager.isTaskDefined(this.taskName)) {
      return true; // already defined
    }

    TaskManager.defineTask(this.taskName, async ({ data, error }) => {
      if (error) {
        console.log("🚨 Task Error:", error);
        return false;
      }

      const { locations } = data;
      const { latitude, longitude, speed } = locations[0].coords;
      const speed_km = Math.round(speed * 3.6); // convert m/s to km/h
      console.log(`current speed_km: ${speed_km}`);

      // Check for auto-stop condition
      await this.checkAutoStop(speed_km, this.stopSubscription.bind(this));
      if (speed_km !== 0) {
        this.__maxSpeed(speed_km);
        this.dataCount += 1;
        this.__avgSpeed(speed_km);
      }
      this.__detectIncident(speed_km);


    });
    return true
  }

  async requestPermissions() {
    const fg = await Location.requestForegroundPermissionsAsync();
    if (fg.status !== "granted") {
      console.log("Foreground permissions denied");
      return false;
    }

    const bg = await Location.requestBackgroundPermissionsAsync();
    if (bg.status !== "granted") {
      console.log("Background permissions denied");
      return false;
    }

    return true;
  }


  async startSubscription() {
    if (! await this.requestPermissions()) {
      console.log('Background permissions not accepted')
      return
    }

    if (! await this.__locationTask()) {
      console.log("failed to start task")
      return
    }

    this.__tripStartTime()
    this.isTracking = true
    // start feeding info to the task
    await Location.startLocationUpdatesAsync(this.taskName, {
      accuracy: Location.Accuracy.Highest,
      timeInterval: 5000,
      distanceInterval: 5,
      // Android foreground service notification (required on Android to keep running)
      foregroundService: {
        notificationTitle: 'Driver Motion',
        notificationBody: 'Background location tracking is active',
      },
    });
  }

  async stopSubscription() {
    try {
      // Check if the background task is running
      const hasStarted = await Location.hasStartedLocationUpdatesAsync(this.taskName);
      if (hasStarted) {
        // Stop the background task
        await Location.stopLocationUpdatesAsync(this.taskName);
        this.isTracking = false
        this.__tripTime()
        console.log(`🕒 Total trip time: ${this.tripTime} minutes`);
        console.log(`🚀 Max speed: ${this.maximumSpeed} km/hr (validated)`);
        console.log(`📊 Avg speed: ${this.averageSpeed} km/hr (validated)`);
        console.log(`⚠️ Total incidents detected: ${this.incidentCount}`);

      } else {
        console.log("ℹ️ No active background location tracking task");
      }
    } catch (error) {
      console.error("❌ Error stopping location tracking:", error);
    }
  }
}

module.exports = LocationTracking