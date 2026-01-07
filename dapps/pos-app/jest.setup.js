/**
 * Jest Setup File
 * This file runs before each test file and sets up mocks and global test configuration
 */

// Note: @testing-library/react-native v12.4+ includes Jest matchers by default
// No need to import extend-expect

// Mock React Native modules
jest.mock("react-native", () => {
  // Use react-native preset's mock instead of requiring actual module
  // This avoids native module dependencies
  const RN = require("react-native/jest/mock");
  return {
    ...RN,
    Appearance: {
      getColorScheme: jest.fn(() => "light"),
    },
    Platform: {
      OS: "ios",
      select: jest.fn((obj) => obj.ios || obj.default),
    },
  };
});

// Mock Expo Secure Store
jest.mock("expo-secure-store", () => {
  const secureStore = new Map();
  return {
    getItemAsync: jest.fn((key) => {
      return Promise.resolve(secureStore.get(key) || null);
    }),
    setItemAsync: jest.fn((key, value) => {
      secureStore.set(key, value);
      return Promise.resolve();
    }),
    deleteItemAsync: jest.fn((key) => {
      secureStore.delete(key);
      return Promise.resolve();
    }),
    // Helper to clear mock storage between tests
    __clearMockStorage: () => secureStore.clear(),
  };
});

// Mock Expo Crypto
jest.mock("expo-crypto", () => {
  // Simple mock hash function for testing
  const mockHash = jest.fn(async (algorithm, data) => {
    // Return a deterministic hash for testing
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  });

  return {
    CryptoDigestAlgorithm: {
      SHA256: "SHA256",
    },
    digestStringAsync: mockHash,
  };
});

// Mock Expo Local Authentication
jest.mock("expo-local-authentication", () => {
  return {
    hasHardwareAsync: jest.fn(() => Promise.resolve(true)),
    isEnrolledAsync: jest.fn(() => Promise.resolve(true)),
    authenticateAsync: jest.fn(() => Promise.resolve({ success: true })),
    AuthenticationType: {
      FACIAL_RECOGNITION: 1,
      FINGERPRINT: 2,
      IRIS: 3,
    },
  };
});

// Mock React Native Device Info
jest.mock("react-native-device-info", () => {
  return {
    getUniqueId: jest.fn(() => Promise.resolve("mock-device-id-12345")),
  };
});

// Mock React Native MMKV (storage)
jest.mock("react-native-mmkv", () => {
  const storage = new Map();
  return {
    createMMKV: jest.fn(() => ({
      set: jest.fn((key, value) => {
        storage.set(key, value);
      }),
      getString: jest.fn((key) => {
        return storage.get(key) || undefined;
      }),
      getAllKeys: jest.fn(() => {
        return Array.from(storage.keys());
      }),
      remove: jest.fn((key) => {
        storage.delete(key);
      }),
      // Helper to clear mock storage between tests
      __clearMockStorage: () => storage.clear(),
    })),
  };
});

// Mock Expo Router
jest.mock("expo-router", () => {
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    dismiss: jest.fn(),
    canGoBack: jest.fn(() => true),
    setParams: jest.fn(),
  };

  return {
    router: mockRouter,
    useRouter: () => mockRouter,
    useLocalSearchParams: () => ({}),
    useGlobalSearchParams: () => ({}),
    useSegments: () => [],
    usePathname: () => "/",
    Link: ({ children, href, ...props }) => {
      const React = require("react");
      return React.createElement("a", { href, ...props }, children);
    },
  };
});

// Mock React Native Reanimated
jest.mock("react-native-reanimated", () => {
  const Reanimated = require("react-native-reanimated/mock");
  // The mock for `call` immediately calls the callback which is incorrect
  // So we override it with a no-op
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock @shopify/react-native-skia (for QR code component)
jest.mock("@shopify/react-native-skia", () => {
  return {
    Skia: {
      Picture: jest.fn(),
      Canvas: jest.fn(),
    },
    Canvas: ({ children }) => {
      const React = require("react");
      return React.createElement(
        "div",
        { "data-testid": "skia-canvas" },
        children,
      );
    },
    Group: ({ children }) => {
      const React = require("react");
      return React.createElement(
        "div",
        { "data-testid": "skia-group" },
        children,
      );
    },
    Path: () => {
      const React = require("react");
      return React.createElement("div", { "data-testid": "skia-path" });
    },
  };
});

// Mock react-native-qrcode-skia
jest.mock("react-native-qrcode-skia", () => {
  const React = require("react");
  return {
    QRCode: ({ value, ...props }) => {
      return React.createElement("div", {
        "data-testid": "qr-code",
        "data-value": value,
        ...props,
      });
    },
  };
});

// Mock react-native-thermal-pos-printer
jest.mock("react-native-thermal-pos-printer", () => {
  return {
    ThermalPrinter: {
      init: jest.fn(() => Promise.resolve()),
      print: jest.fn(() => Promise.resolve()),
      cutPaper: jest.fn(() => Promise.resolve()),
      getBluetoothDeviceList: jest.fn(() => Promise.resolve([])),
      connectBluetoothPrinter: jest.fn(() => Promise.resolve()),
      disconnectBluetoothPrinter: jest.fn(() => Promise.resolve()),
    },
  };
});

// Mock react-native-toast-message
jest.mock("react-native-toast-message", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: {
      show: jest.fn(),
      hide: jest.fn(),
    },
    BaseToast: ({ text1, text2, ...props }) => {
      return React.createElement("div", { "data-testid": "toast", ...props }, [
        text1 && React.createElement("div", { key: "text1" }, text1),
        text2 && React.createElement("div", { key: "text2" }, text2),
      ]);
    },
  };
});

// Mock Expo Constants
jest.mock("expo-constants", () => {
  return {
    __esModule: true,
    default: {
      expoConfig: {
        version: "1.0.0",
      },
    },
  };
});

// Mock Expo Application
jest.mock("expo-application", () => {
  return {
    nativeApplicationVersion: "1.0.0",
    nativeBuildVersion: "1",
  };
});

// Mock global fetch for API client tests
global.fetch = jest.fn();

// Suppress console warnings/errors in tests (optional - comment out if you want to see them)
global.console = {
  ...console,
  // Uncomment to ignore specific console methods
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Set up environment variables for tests
process.env.EXPO_PUBLIC_API_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://api.test.example.com";
process.env.EXPO_PUBLIC_PROJECT_ID =
  process.env.EXPO_PUBLIC_PROJECT_ID || "test-project-id";
process.env.EXPO_PUBLIC_GATEWAY_URL =
  process.env.EXPO_PUBLIC_GATEWAY_URL || "https://gateway.test.example.com";

// Cleanup function to reset mocks between tests
afterEach(() => {
  jest.clearAllMocks();

  // Clear mock storage
  const SecureStore = require("expo-secure-store");
  if (SecureStore.__clearMockStorage) {
    SecureStore.__clearMockStorage();
  }

  const MMKV = require("react-native-mmkv");
  const mmkvInstance = MMKV.createMMKV();
  if (mmkvInstance.__clearMockStorage) {
    mmkvInstance.__clearMockStorage();
  }

  // Reset fetch mock
  if (global.fetch) {
    global.fetch.mockClear();
  }
});
