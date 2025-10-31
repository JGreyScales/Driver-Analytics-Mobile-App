// ✅ Required gesture-handler patch
import "react-native-gesture-handler/jestSetup";

// ✅ Mock Expo runtime to avoid winter runtime errors
global.expo = {
  EventEmitter: { addListener: jest.fn(), removeSubscription: jest.fn() },
};

// ✅ Mock Animated helper (Expo SDK 54 / RN 0.81)
jest.mock("react-native/Libraries/Animated/NativeAnimatedHelper", () => ({
  __esModule: true,
  default: {},
}));

// ✅ Mock timing to avoid "undefined is not a function" in RN.animate
jest.mock("react-native/Libraries/Animated/animations/TimingAnimation", () => ({
  __esModule: true,
  default: jest.fn(),
}));

// ✅ Silence animation warning
jest.mock("react-native/Libraries/Animated/NativeAnimated", () => ({
  __esModule: true,
  default: {
    timing: jest.fn().mockReturnValue({
      start: jest.fn(),
    }),
  },
}));

// ✅ Mock fetch globally
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ message: "Account created" }),
  })
);

// ✅ Mock alert
global.alert = jest.fn();

// ✅ Silence console.error for clean test logs
jest.spyOn(global.console, "error").mockImplementation(() => {});