import { jest } from "@jest/globals";
import LocationTracking from "../../src/utils/locationTracking";
import NotificationManager from "../../src/utils/notificationManager";

// ✅ silence all console logs/warns for clean test output
beforeAll(() => {
  jest.spyOn(console, "warn").mockImplementation(() => {});
  jest.spyOn(console, "log").mockImplementation(() => {});
});

// ✅ Mock NotificationManager so no real notifications trigger
jest.mock("../../src/utils/NotificationManager", () => ({
  sendNotification: jest.fn(),
}));

// Common setup helper
const setupTracker = () => {
  const tracker = new LocationTracking();
  tracker.tripStart = null; 
  jest.clearAllMocks();
  jest.useFakeTimers().setSystemTime(new Date("2025-01-01T00:00:00Z"));
  return tracker;
};

afterEach(() => {
  jest.useRealTimers();
});

//
// ----------------------------
// 🕒 __tripStartTime()
// ----------------------------
describe("__tripStartTime", () => {
  test("sets tripStart to current time", () => {
    const tracker = setupTracker();
    tracker.__tripStartTime();
    expect(tracker.tripStart).toBe(Date.now());
  });
});

//
// ----------------------------
// ⏱ __tripTime()
// ----------------------------
describe("__tripTime", () => {
  test("calculates trip duration in minutes", () => {
    const tracker = setupTracker();
    tracker.tripStart = Date.now() - 180000; // 3 minutes ago
    tracker.__tripTime();
    expect(tracker.tripTime).toBe("3");
  });

  test("handles when tripStart is missing (no crash)", () => {
    const tracker = setupTracker();
    tracker.tripStart = null; // ensure definitely null here
    tracker.__tripTime();


    expect(tracker.tripTime).not.toBeInstanceOf(Number); 
  });

});

//
// ----------------------------
// 🚗 __maxSpeed()
// ----------------------------
describe("__maxSpeed", () => {
  test("updates maxSpeed correctly", () => {
    const tracker = setupTracker();
    tracker.__maxSpeed(60);
    expect(tracker.maxSpeed).toBe(60);

    tracker.__maxSpeed(80);
    expect(tracker.maxSpeed).toBe(80);

    tracker.__maxSpeed(50);
    expect(tracker.maxSpeed).toBe(80);
  });
});

//
// ----------------------------
// 📊 __avgSpeed()
// ----------------------------
describe("__avgSpeed", () => {
  test("computes running average speed", () => {
    const tracker = setupTracker();
    tracker.dataCount = 3;
    tracker.avgSpeed = 50;
    tracker.__avgSpeed(70);
    expect(tracker.avgSpeed).toBeCloseTo((50 * 2 + 70) / 3);
  });

  test("handles 0 dataCount gracefully", () => {
    const tracker = setupTracker();
    tracker.dataCount = 0;
    tracker.__avgSpeed(60);
    expect(tracker.avgSpeed).toBeGreaterThan(0);
  });
});

//
// ----------------------------
// ⚠️ __detectIncident()
// ----------------------------
describe("__detectIncident", () => {
  test("detects harsh braking", () => {
    const tracker = setupTracker();
    tracker.prevSpeed = 100;
    tracker.prevTimestamp = Date.now() - 1000;

    tracker.__detectIncident(80);
    expect(NotificationManager.sendNotification).toHaveBeenCalledWith(
      "🛑 Harsh Braking",
      "Sudden stop detected!"
    );
    expect(tracker.incidentCount).toBe(1);
  });

  test("detects rapid acceleration", () => {
    const tracker = setupTracker();
    tracker.prevSpeed = 50;
    tracker.prevTimestamp = Date.now() - 1000;

    tracker.__detectIncident(70);
    expect(NotificationManager.sendNotification).toHaveBeenCalledWith(
      "🚀 Incident detected: Rapid acceleration"
    );
    expect(tracker.incidentCount).toBe(1);
  });

  test("detects overspeeding and logs notification", () => {
    const tracker = setupTracker();
    tracker.maxAllowedSpeed = 100;
    tracker.prevSpeed = 90;
    tracker.prevTimestamp = Date.now() - 1000;

    tracker.__detectIncident(120);
    expect(NotificationManager.sendNotification).toHaveBeenCalledWith(
      "⚠️ Overspeeding",
      "You are exceeding the speed limit!"
    );
    // rapid acceleration + overspeed both count
    expect(tracker.incidentCount).toBe(2);
  });

  test("resets overspeed when speed returns to normal", () => {
    const tracker = setupTracker();
    tracker.overSpeedStartTime = Date.now();
    tracker.prevSpeed = 120;
    tracker.prevTimestamp = Date.now() - 1000;

    tracker.__detectIncident(80);
    expect(NotificationManager.sendNotification).toHaveBeenCalledWith(
      "✅ Speed Normalized",
      "You are back within the speed limit."
    );
    expect(tracker.overSpeedStartTime).toBeNull();
  });

  test("Prev timestamp should be replaced by the first reading", () => {
    const tracker = setupTracker();

    tracker.__detectIncident(80);
    expect(tracker.prevTimestamp).toBe(Date.now());
    expect(tracker.prevSpeed).toBe(80);
    expect(tracker.incidentCount).toBe(0);
  });

  test("does not increment incident count for minor speed changes", () => {
    const tracker = setupTracker();
    tracker.prevSpeed = 60;
    tracker.prevTimestamp = Date.now() - 1000;
    tracker.__detectIncident(62); // minor change
    expect(tracker.incidentCount).toBe(0);
  });

  test("does increment incident count for sustained overspeeding", () => {
    const tracker = setupTracker();
    tracker.maxAllowedSpeed = 100;
    tracker.prevSpeed = 110;
    tracker.prevTimestamp = Date.now() - 2000;
    tracker.overSpeedStartTime = Date.now() - 2000000; // overspeeding started earlier
    tracker.lastIncidentTime = Date.now() - 2000000;
    tracker.incidentCount = 1; // already had one incident

    tracker.__detectIncident(110);
    expect(tracker.incidentCount).toBe(2); // should increment
    expect(NotificationManager.sendNotification).toHaveBeenCalledWith(
      "⚠️ Overspeeding",
      "You are still exceeding the speed limit!"
    );
  });
});