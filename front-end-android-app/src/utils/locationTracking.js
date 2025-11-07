import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";


class LocationTracking {
    constructor() {
        this.subscription = null
        this.taskName = "LOCATION_TRACKING_TASK"
        this.tripStart = null
        this.tripTime = null
        this.incidentCount = null
        this.maxSpeed = null
        this.avgSpeed = null
    }
    
    __tripStartTime(){
        this.tripStart = Date.now()
    }

    __tripTime(){
        this.tripTime = Date.now() - this.tripStart
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
          
            console.log("📍 Background Update Triggered");
          
            const { locations } = data;
            const { latitude, longitude, speed } = locations[0].coords;
          
            console.log("📌 Location:", latitude, longitude);
            console.log(`current speed: ${speed}`)


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
            console.log("🛑 Background location tracking stopped");
          } else {
            console.log("ℹ️ No active background location tracking task");
          }
        } catch (error) {
          console.error("❌ Error stopping location tracking:", error);
        }
      }     
}

module.exports = LocationTracking