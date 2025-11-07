import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";


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

        // 🕓 Auto-stop tracking variables
        this.lastMovementTime = null; // last time movement was detected
        this.idleStartTime = null;    // when idle started
        this.idleTimeout = 10 * 1000; // 10 minutes in ms (adjust for testing)
        this.autoStopTriggered = false; // prevent multiple stops
    }
    
    __tripStartTime(){
        this.tripStart = Date.now()
    }

    __tripTime(){
        this.tripTime = Date.now() - this.tripStart;
        this.tripTime = (this.tripTime / 60000).toFixed(0);
    }

    __maxSpeed(speed_km){
        if (this.maxSpeed == null || speed_km > this.maxSpeed){
            this.maxSpeed = speed_km
        }
    }

    __avgSpeed(currentSpeed){
      this.avgSpeed = ((this.avgSpeed * (this.dataCount - 1)) + Number(currentSpeed)) / this.dataCount;
    }

    async checkAutoStop(currentSpeed, stopCallback) {
        const now = Date.now();

        // 1️⃣ Vehicle is moving → reset idle timer
        if (currentSpeed > 2) { // moving threshold (2 km/h to ignore small GPS noise)
          this.lastMovementTime = now;
          this.idleStartTime = null;
          this.autoStopTriggered = false;
          return;
        }

        // 2️⃣ Vehicle has stopped → record idle start time
        if (!this.idleStartTime) {
          this.idleStartTime = now;
          console.log("🕒 Idle started at:", new Date(this.idleStartTime).toLocaleTimeString());
        }

        // 3️⃣ Check if idle duration exceeded threshold
        const idleDuration = now - this.idleStartTime;

        if (!this.autoStopTriggered && idleDuration >= this.idleTimeout) {
          console.log(`🛑 Auto-Stop triggered after ${(idleDuration / 60000).toFixed(1)} minutes idle`);
          this.autoStopTriggered = true;
          if (typeof stopCallback === "function") {
            await stopCallback(); 
          }
        }
    }

    async __locationTask(){
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
            this.__maxSpeed(speed_km);
            this.dataCount += 1;
            this.__avgSpeed(speed_km);
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

        if (! await this.__locationTask()){
            console.log("failed to start task")
            return
        }

        this.__tripStartTime()

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
            this.__tripTime()
            console.log(`🕒 Total trip time: ${this.tripTime} minutes`);
            console.log(`🚀 Max speed_km: ${this.maxSpeed} km/hr`);
            this.avgSpeed = Math.round(this.avgSpeed); 
            console.log(`📊 Avg speed_km: ${this.avgSpeed} km/hr`);
          } else {
            console.log("ℹ️ No active background location tracking task");
          }
        } catch (error) {
          console.error("❌ Error stopping location tracking:", error);
        }
      }     
}

module.exports = LocationTracking