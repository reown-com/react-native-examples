import "@/utils/polyfills";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import Toast from "react-native-toast-message";

import HeaderImage from "@/components/header-image";
import { ThemedText } from "@/components/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useFonts } from "expo-font";

import { useTheme } from "@/hooks/use-theme-color";
import { useUrlCredentials } from "@/hooks/use-url-credentials";
import * as Sentry from "@sentry/react-native";

import { WalletConnectLoading } from "@/components/walletconnect-loading";
import { Spacing } from "@/constants/spacing";
import { useLogsStore } from "@/store/useLogsStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { getDeviceIdentifier } from "@/utils/misc";
import { requestBluetoothPermission } from "@/utils/printer";
import { initSentry } from "@/utils/sentry";
import { showInfoToast } from "@/utils/toast";
import { toastConfig } from "@/utils/toasts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useEffect, useRef } from "react";
import { Platform, View } from "react-native";
import {
  initialWindowMetrics,
  SafeAreaProvider,
} from "react-native-safe-area-context";

initSentry();

const queryClient = new QueryClient();

const renderHeaderTitle = (title: string) => {
  const HeaderTitle = () => (
    <ThemedText fontSize={18} style={{ fontWeight: "500" }}>
      {title}
    </ThemedText>
  );
  return HeaderTitle;
};

// Build once at module scope so each Stack.Screen gets a stable headerTitle
// reference — React Navigation compares by identity and would otherwise
// remount the header (visible flicker) on every RootLayout re-render.
const SettingsHeaderTitle = renderHeaderTitle("Settings");
const TransactionsHeaderTitle = renderHeaderTitle("Transactions");
const LogsHeaderTitle = renderHeaderTitle("Logs");

export default Sentry.wrap(function RootLayout() {
  const colorScheme = useColorScheme();

  const appLoadedReported = useRef(false);

  const setDeviceId = useSettingsStore((state) => state.setDeviceId);
  const deviceId = useSettingsStore((state) => state.deviceId);
  const _hasHydrated = useSettingsStore((state) => state._hasHydrated);
  const Theme = useTheme();
  const [fontsLoaded] = useFonts({
    "KH Teka": require("@/assets/fonts/KHTeka-Regular.otf"),
    "KH Teka Light": require("@/assets/fonts/KHTeka-Light.otf"),
    "KH Teka Medium": require("@/assets/fonts/KHTeka-Medium.otf"),
    "KH Teka Mono": require("@/assets/fonts/KHTekaMono-Regular.otf"),
  });

  // Ends Sentry's app-start span once real UI can render (after hydration + fonts).
  useEffect(() => {
    if (!appLoadedReported.current && _hasHydrated && fontsLoaded) {
      Sentry.appLoaded();
      appLoadedReported.current = true;
    }
  }, [_hasHydrated, fontsLoaded]);

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
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: Theme["bg-primary"],
        }}
      >
        <WalletConnectLoading size={180} />
      </View>
    );
  }

  // Match the navigator's background (shown behind screens during transitions)
  // to the app background so iOS native-stack push/pop doesn't flash the white
  // window underneath. react-navigation's DarkTheme background is pure black
  // (rgb(1,1,1)), not our bg-primary.
  const baseNavTheme = colorScheme === "dark" ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...baseNavTheme,
    colors: {
      ...baseNavTheme.colors,
      background: Theme["bg-primary"],
      card: Theme["bg-primary"],
    },
  };

  return (
    <GestureHandlerRootView
      style={{ flex: 1, backgroundColor: Theme["bg-primary"] }}
    >
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider value={navigationTheme}>
            <Stack
              screenOptions={({ route }) => {
                return {
                  headerTitle: ({ tintColor }) => (
                    <HeaderImage
                      tintColor={
                        typeof tintColor === "string" ? tintColor : undefined
                      }
                    />
                  ),
                  headerShadowVisible: false,
                  headerTintColor: Theme["text-primary"],
                  headerBackButtonDisplayMode: "minimal",
                  headerTitleAlign: "center",
                  headerStyle: {
                    backgroundColor: Theme["bg-primary"],
                  },
                  headerRightContainerStyle: {
                    ...(Platform.OS === "web" && {
                      paddingRight: Spacing["spacing-3"],
                    }),
                  },
                  headerLeftContainerStyle: {
                    ...(Platform.OS === "web" && {
                      paddingLeft: Spacing["spacing-3"],
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
              <Stack.Screen
                name="index"
                options={{
                  contentStyle: {
                    backgroundColor: Theme["bg-primary"],
                    paddingBottom: 0,
                  },
                }}
              />
              <Stack.Screen
                name="amount"
                // When resetNavigation lands here via a replace (target not in
                // the stack, e.g. from payment-success), animate it as a
                // backward pop rather than a forward push.
                options={{ animationTypeForReplace: "pop" }}
              />
              <Stack.Screen name="scan" />
              <Stack.Screen
                name="payment-failure"
                options={{
                  headerBackVisible: false,
                  gestureEnabled: false,
                }}
              />
              <Stack.Screen
                name="payment-success"
                options={{
                  headerShown: false,
                  gestureEnabled: false,
                  contentStyle: {
                    backgroundColor: Theme["bg-primary"],
                    paddingBottom: 0,
                  },
                }}
              />
              <Stack.Screen
                name="settings"
                options={{ headerTitle: SettingsHeaderTitle }}
              />
              <Stack.Screen
                name="activity"
                options={{ headerTitle: TransactionsHeaderTitle }}
              />
              <Stack.Screen
                name="logs"
                options={{ headerTitle: LogsHeaderTitle }}
              />
            </Stack>
            <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
            <Toast
              config={toastConfig}
              position="top"
              topOffset={(initialWindowMetrics?.insets.top ?? 0) + 8}
              visibilityTime={2000}
            />
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
});
