import "react-native-gesture-handler/jestSetup";

// Mock Expo modules
jest.mock("expo", () => ({}));
jest.mock("expo-crypto", () => ({
  digestStringAsync: jest.fn(() => "mockHash"),
}));

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock Alert
global.alert = jest.fn();

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ message: "Account created successfully" }),
  })
);