import "@/utils/polyfills";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useNavigationContainerRef } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import Toast from "react-native-toast-message";

import HeaderImage from "@/components/header-image";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useFonts } from "expo-font";

import { useTheme } from "@/hooks/use-theme-color";
import { useUrlCredentials } from "@/hooks/use-url-credentials";
import {
  getHeaderBackgroundColor,
  getHeaderTintColor,
  shouldCenterHeaderTitle,
} from "@/utils/navigation";
import * as Sentry from "@sentry/react-native";

import { WalletConnectLoading } from "@/components/walletconnect-loading";
import { Spacing } from "@/constants/spacing";
import { useLogsStore } from "@/store/useLogsStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { getDeviceIdentifier } from "@/utils/misc";
import { requestBluetoothPermission } from "@/utils/printer";
import { showInfoToast } from "@/utils/toast";
import { toastConfig } from "@/utils/toasts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useEffect, useRef } from "react";
import { Platform, View } from "react-native";
import {
  initialWindowMetrics,
  SafeAreaProvider,
} from "react-native-safe-area-context";

// Tracks screen transitions as transactions so Mobile Vitals (slow/frozen
// frames, TTID) are attributed to the route the user was on. The navigation
// container ref is registered in RootLayout once expo-router mounts it.
const navigationIntegration = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay: true,
});

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  sendDefaultPii: false,

  // Structured logging adds serialization + network overhead in production and
  // duplicates the in-app logs store, so keep it to development only.
  enableLogs: __DEV__,

  // Configure Session Replay
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,

  // Performance monitoring. Setting tracesSampleRate activates the default
  // React Native tracing integration, which captures Mobile Vitals
  // (slow/frozen frames, frame delay), screen TTID/TTFD and app-start time —
  // the metrics that surface jank on low-end POS hardware. Native frames
  // tracking is enabled by default. Sampled to keep overhead low on weak
  // devices; raise temporarily when actively investigating.
  tracesSampleRate: 0.2,
  enableUserInteractionTracing: true,

  // Merged with Sentry's default integrations (which include native frames +
  // app-start tracking); does not replace them.
  integrations: [navigationIntegration],

  environment: __DEV__ ? "development" : "production",

  spotlight: __DEV__,
});

const queryClient = new QueryClient();

export default Sentry.wrap(function RootLayout() {
  const colorScheme = useColorScheme();

  const navigationRef = useNavigationContainerRef();
  const navRegistered = useRef(false);

  const setDeviceId = useSettingsStore((state) => state.setDeviceId);
  const deviceId = useSettingsStore((state) => state.deviceId);
  const _hasHydrated = useSettingsStore((state) => state._hasHydrated);
  const Theme = useTheme();
  const [fontsLoaded] = useFonts({
    "KH Teka": require("@/assets/fonts/KHTeka-Regular.otf"),
    "KH Teka Light": require("@/assets/fonts/KHTeka-Light.otf"),
    "KH Teka Medium": require("@/assets/fonts/KHTeka-Medium.otf"),
  });

  // Register the expo-router navigation container with Sentry so route changes
  // become transactions. The container only mounts once the app has hydrated
  // and fonts have loaded (the loader renders until then), so the ref isn't
  // populated on the first effect pass — and ref mutations alone don't re-run
  // effects. Keying on those flags re-runs this once the container exists.
  useEffect(() => {
    if (!navRegistered.current && navigationRef?.current) {
      navigationIntegration.registerNavigationContainer(navigationRef);
      navRegistered.current = true;
    }
  }, [navigationRef, _hasHydrated, fontsLoaded]);

  useEffect(() => {
    async function getDeviceId() {
      const deviceId = await getDeviceIdentifier();
      setDeviceId(deviceId);
    }
    if (!deviceId) {
      getDeviceId();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceId]);

  // Request Bluetooth permission on first app load (Android only)
  // Apply credentials from URL query params (web only)
  useUrlCredentials();

  useEffect(() => {
    async function checkBluetoothPermission() {
      if (Platform.OS !== "android") return;

      try {
        const granted = await requestBluetoothPermission();
        if (!granted) {
          useLogsStore
            .getState()
            .addLog(
              "error",
              "Bluetooth permission denied",
              "layout",
              "checkBluetoothPermission",
            );
          showInfoToast("We need Bluetooth to connect your printer.");
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        useLogsStore
          .getState()
          .addLog("error", errorMessage, "layout", "checkBluetoothPermission", {
            error,
          });
      }
    }
    checkBluetoothPermission();
  }, []);

  if (!_hasHydrated || !fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <WalletConnectLoading size={180} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider
            value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
          >
            <Stack
              screenOptions={({ route }) => {
                const centerTitle = shouldCenterHeaderTitle(route.name);
                const headerTintColor = getHeaderTintColor(route.name);
                const headerBackgroundColor = getHeaderBackgroundColor(
                  route.name,
                );

                return {
                  headerTitle: centerTitle ? HeaderImage : "",
                  headerRight: !centerTitle
                    ? () => (
                        <HeaderImage
                          padding
                          tintColor={Theme[headerTintColor]}
                        />
                      )
                    : undefined,
                  headerShadowVisible: false,
                  headerTintColor: Theme[headerTintColor],
                  headerBackButtonDisplayMode: "minimal",
                  headerTitleAlign: "center",
                  headerStyle: {
                    backgroundColor: Theme[headerBackgroundColor],
                    ...(Platform.OS === "web" && {
                      paddingHorizontal: Spacing["spacing-3"],
                    }),
                  },
                  contentStyle: {
                    backgroundColor: Theme["bg-primary"],
                    paddingBottom: Platform.select({
                      ios: Spacing["spacing-6"],
                      android: Spacing["spacing-12"],
                      web: Spacing["spacing-4"],
                    }),
                  },
                };
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="amount" />
              <Stack.Screen name="scan" />
              <Stack.Screen
                name="payment-failure"
                options={{
                  headerBackVisible: false,
                }}
              />
              <Stack.Screen
                name="payment-success"
                options={{
                  headerBackVisible: false,
                }}
              />
              <Stack.Screen name="settings" />
              <Stack.Screen name="activity" />
              <Stack.Screen name="logs" />
            </Stack>
            <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
            <Toast
              config={toastConfig}
              position="bottom"
              bottomOffset={initialWindowMetrics?.insets.bottom ?? 0}
              visibilityTime={2000}
            />
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
});
