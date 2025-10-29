// jest.setup.js
// Patch Expo 54's winter runtime for Jest
globalThis.expo = {
  EventEmitter: class {},
  __ExpoImportMetaRegistry: {},
};

// Prevent Expo async-require errors by mocking it manually
jest.mock('expo/src/async-require/messageSocket', () => ({}));

// Load Testing-Library matchers
require('@testing-library/jest-native/extend-expect');

// Optionally silence reanimated if installed
try {
  jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));
} catch (_) {}
