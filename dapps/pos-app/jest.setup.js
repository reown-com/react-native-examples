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
  const React = require("react");

  // Create mock components that render as simple Views
  const createMockComponent = (name) => {
    const Component = React.forwardRef(
      ({ children, testID, ...props }, ref) => {
        return React.createElement("View", { testID, ref, ...props }, children);
      },
    );
    Component.displayName = name;
    return Component;
  };

  const View = createMockComponent("View");
  const Text = createMockComponent("Text");
  const Pressable = React.forwardRef(
    (
      {
        children,
        onPress,
        disabled,
        accessibilityRole,
        testID,
        style,
        accessibilityState,
        ...props
      },
      ref,
    ) => {
      return React.createElement(
        "View",
        {
          testID,
          ref,
          style,
          // Use onPress (not onClick) to match React Native API
          // Set to undefined when disabled so fireEvent.press won't find a handler
          onPress: disabled ? undefined : onPress,
          accessibilityRole,
          accessibilityState: { ...accessibilityState, disabled },
          ...props,
        },
        typeof children === "function"
          ? children({ pressed: false })
          : children,
      );
    },
  );
  Pressable.displayName = "Pressable";
  const Image = createMockComponent("Image");
  const TouchableOpacity = createMockComponent("TouchableOpacity");

  return {
    View,
    Text,
    Pressable,
    Image,
    TouchableOpacity,
    ScrollView: createMockComponent("ScrollView"),
    SafeAreaView: createMockComponent("SafeAreaView"),
    ActivityIndicator: createMockComponent("ActivityIndicator"),
    TextInput: createMockComponent("TextInput"),
    FlatList: createMockComponent("FlatList"),
    ImageSourcePropType: {},
    StyleSheet: {
      create: (styles) => styles,
      flatten: (style) => {
        if (Array.isArray(style)) {
          return Object.assign({}, ...style.filter(Boolean));
        }
        return style || {};
      },
      hairlineWidth: 1,
    },
    Appearance: {
      getColorScheme: jest.fn(() => "light"),
    },
    Platform: {
      OS: "ios",
      select: jest.fn((obj) => obj.ios || obj.default),
    },
    Dimensions: {
      get: jest.fn(() => ({ width: 375, height: 812 })),
    },
    useColorScheme: jest.fn(() => "light"),
    useWindowDimensions: jest.fn(() => ({ width: 375, height: 812 })),
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
  const React = require("react");

  // Create mock animated values and functions
  const mockAnimatedValue = (value) => ({
    value,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    removeAllListeners: jest.fn(),
  });

  return {
    __esModule: true,
    default: {
      View: ({ children, style, ...props }) =>
        React.createElement("View", { style, ...props }, children),
      Text: ({ children, style, ...props }) =>
        React.createElement("View", { style, ...props }, children),
      Image: (props) => React.createElement("View", props),
      call: jest.fn(),
      createAnimatedComponent: (Component) => Component,
    },
    View: ({ children, style, ...props }) =>
      React.createElement("View", { style, ...props }, children),
    Text: ({ children, style, ...props }) =>
      React.createElement("View", { style, ...props }, children),
    Image: (props) => React.createElement("View", props),
    useSharedValue: (initialValue) => ({ value: initialValue }),
    useAnimatedStyle: (styleFunc) => styleFunc(),
    useDerivedValue: (valueFunc) => ({ value: valueFunc() }),
    withTiming: (toValue) => toValue,
    withSpring: (toValue) => toValue,
    withDelay: (delay, animation) => animation,
    withSequence: (...animations) => animations[0],
    withRepeat: (animation) => animation,
    runOnJS: (fn) => fn,
    runOnUI: (fn) => fn,
    interpolate: jest.fn((value) => value),
    Extrapolate: { CLAMP: "clamp", EXTEND: "extend", IDENTITY: "identity" },
    Extrapolation: { CLAMP: "clamp", EXTEND: "extend", IDENTITY: "identity" },
    Easing: {
      linear: jest.fn(),
      ease: jest.fn(),
      bezier: jest.fn(() => jest.fn()),
      in: jest.fn(),
      out: jest.fn(),
      inOut: jest.fn(),
    },
    createAnimatedComponent: (Component) => Component,
    FadeIn: { duration: jest.fn(() => ({ delay: jest.fn() })) },
    FadeOut: { duration: jest.fn(() => ({ delay: jest.fn() })) },
    Layout: {},
  };
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
  const QRCodeSkia = ({ value, testID, ...props }) => {
    return React.createElement("View", {
      testID: testID || "qr-code-skia",
      "data-value": value,
      ...props,
    });
  };
  return {
    __esModule: true,
    default: QRCodeSkia,
    QRCode: QRCodeSkia,
  };
});

// Mock pressto (PressableScale used by Button)
jest.mock("pressto", () => {
  const React = require("react");
  return {
    PressableScale: ({
      children,
      onPress,
      enabled = true,
      style,
      testID,
      ...props
    }) => {
      // Wrap onPress to respect enabled state
      const handlePress = enabled ? onPress : undefined;
      return React.createElement(
        "View",
        {
          testID,
          style,
          // Use onPress (not onClick) so fireEvent.press works correctly
          // Only provide onPress when enabled
          onPress: handlePress,
          accessibilityRole: "button",
          accessibilityState: { disabled: !enabled },
          ...props,
        },
        children,
      );
    },
  };
});

// Mock expo-asset
jest.mock("expo-asset", () => {
  return {
    useAssets: jest.fn(() => [[{ uri: "mock-asset-uri" }], null]),
  };
});

// Mock expo-image
jest.mock("expo-image", () => {
  const React = require("react");
  return {
    Image: ({ testID, source, style, ...props }) => {
      return React.createElement("View", {
        testID: testID || "expo-image",
        style,
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

// Final cleanup after all tests to ensure Jest exits
afterAll(async () => {
  // Reset React Query notifyManager scheduler
  // This ensures any pending callbacks are executed
  const { notifyManager } = require("@tanstack/react-query");
  notifyManager.setScheduler((callback) => {
    callback();
  });

  // Give any pending async operations time to complete
  // Use a small delay to let React Query and other async operations finish
  await new Promise((resolve) => setTimeout(resolve, 100));
});
