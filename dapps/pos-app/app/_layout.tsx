import "@/utils/polyfills";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import Toast from "react-native-toast-message";

import HeaderImage from "@/components/header-image";
import { useColorScheme } from "@/hooks/use-color-scheme";

import { useTheme } from "@/hooks/use-theme-color";
import {
  getHeaderBackgroundColor,
  getHeaderTintColor,
  shouldCenterHeaderTitle,
} from "@/utils/navigation";
import * as Sentry from "@sentry/react-native";

import { Spacing } from "@/constants/spacing";
import { useSettingsStore } from "@/store/useSettingsStore";
import { getDeviceIdentifier } from "@/utils/misc";
import { toastConfig } from "@/utils/toasts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { Platform } from "react-native";
import {
  initialWindowMetrics,
  SafeAreaProvider,
} from "react-native-safe-area-context";

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  sendDefaultPii: false,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
  integrations: [],

  environment: "default",

  spotlight: __DEV__,
});

const queryClient = new QueryClient();

export default Sentry.wrap(function RootLayout() {
  const colorScheme = useColorScheme();
  const { setDeviceId, deviceId } = useSettingsStore((state) => state);
  const Theme = useTheme();

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
                  },
                  contentStyle: {
                    backgroundColor: Theme["bg-primary"],
                    paddingBottom:
                      Platform.OS === "ios"
                        ? Spacing["spacing-6"]
                        : Spacing["spacing-12"],
                  },
                };
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="amount" />
              <Stack.Screen name="scan" />
              <Stack.Screen name="payment-failure" />
              <Stack.Screen
                name="payment-success"
                options={{
                  headerBackVisible: false,
                }}
              />
              <Stack.Screen name="settings" />
            </Stack>
            <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
            <Toast
              config={toastConfig}
              position="bottom"
              visibilityTime={6000}
            />
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
});
