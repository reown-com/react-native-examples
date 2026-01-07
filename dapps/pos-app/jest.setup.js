/**
 * Jest Setup File
 * This file runs before each test file and sets up mocks and global test configuration
 */

// Note: @testing-library/react-native v13.3+ includes Jest matchers by default
// No need to import extend-expect

// Disable __DEV__ to prevent development-only console.log statements (e.g., in useLogsStore)
global.__DEV__ = false;

// Configure React Query to not use setTimeout batching in tests
// This prevents the "worker process has failed to exit gracefully" warning
const { notifyManager } = require("@tanstack/react-query");
notifyManager.setScheduler((callback) => {
  callback();
});

// Suppress React Query's act() warnings in tests
// These warnings come from React Query's internal state management and are expected
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === "string" &&
    args[0].includes("not wrapped in act(...)")
  ) {
    return;
  }
  originalConsoleError(...args);
};

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
// Each test gets isolated storage via beforeEach cleanup in afterEach hook
jest.mock("expo-secure-store", () => {
  // Shared storage instance - cleared between tests via __clearMockStorage
  let secureStore = new Map();

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
    // Helper to clear mock storage between tests - called in afterEach
    __clearMockStorage: () => {
      secureStore = new Map();
    },
  };
});

// Mock Expo Crypto
jest.mock("expo-crypto", () => {
  // Deterministic mock hash function for testing
  // Returns predictable values based on input content for proper PIN/hash comparisons
  const mockHash = jest.fn(async (algorithm, data) => {
    // Create a simple deterministic hash based on content
    // This ensures different inputs produce different outputs (important for PIN tests)
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      hash = (hash * 31 + data.charCodeAt(i)) >>> 0; // Unsigned 32-bit
    }
    return `${algorithm}-${hash.toString(16)}`;
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
// Each createMMKV() call gets its own isolated storage instance for proper test isolation
jest.mock("react-native-mmkv", () => {
  return {
    createMMKV: jest.fn(() => {
      // Create new storage instance per call for test isolation
      const storage = new Map();
      return {
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
        clearAll: jest.fn(() => {
          storage.clear();
        }),
      };
    }),
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

// Set up environment variables for tests
// Force test-only URLs to prevent accidental real endpoint calls
// Using .invalid TLD per RFC 2606 to ensure these can never resolve
process.env.EXPO_PUBLIC_API_URL = "https://api.test.example.com";
process.env.EXPO_PUBLIC_PROJECT_ID = "test-project-id";
process.env.EXPO_PUBLIC_GATEWAY_URL = "https://gateway.test.example.com";

// Cleanup function to reset mocks between tests
afterEach(() => {
  jest.clearAllMocks();

  // Clear SecureStore mock storage for test isolation
  const SecureStore = require("expo-secure-store");
  if (SecureStore.__clearMockStorage) {
    SecureStore.__clearMockStorage();
  }

  // Note: MMKV mock creates new storage per createMMKV() call,
  // so no global cleanup needed. Jest's clearAllMocks() resets the mock functions.

  // Reset fetch mock
  if (global.fetch) {
    global.fetch.mockClear();
  }
});
