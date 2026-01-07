module.exports = {
  preset: "react-native",
  testMatch: ["**/*.test.ts", "**/*.test.tsx"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  transformIgnorePatterns: [
    "node_modules/(?!(react-native|@react-native|expo|@expo|@react-navigation|@tanstack|zustand|@shopify|react-native-qrcode-skia|react-native-thermal-pos-printer|react-native-mmkv|react-native-device-info|react-native-reanimated|react-native-worklets|pressto|@walletconnect|uuid)/)",
  ],
  collectCoverageFrom: [
    "**/*.{ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/__tests__/**",
    "!**/jest.setup.js",
    "!**/index.ts",
    "!**/index.web.tsx",
    "!**/app/_layout.tsx",
    "!**/app/**/*.tsx", // Exclude app screens for now (can add later)
    "!**/constants/**",
    "!**/types.d.ts",
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  // The react-native preset handles the necessary environment setup.
  testEnvironment: "node",
};
