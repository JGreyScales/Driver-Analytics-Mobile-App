module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|react-native|@react-native|@react-navigation|expo(nent)?|@expo(nent)?/.*|react-native-expo-sha256))',
  ],
};
