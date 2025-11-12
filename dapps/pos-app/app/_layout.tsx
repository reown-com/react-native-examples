import "@/config/polyfills";

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
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { POSProvider } from "@/context/POSContext";
import React, { useEffect, useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  sendDefaultPii: false,

  // Enable Logs
  enableLogs: __DEV__ ? true : false,

  // Configure Session Replay
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
  integrations: [],

  spotlight: __DEV__,
});

const queryClient = new QueryClient();

export default Sentry.wrap(function RootLayout() {
  const { bottom } = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const Theme = useTheme();

  const posClientRef = useRef<any | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    async function initializePOSClient() {
      try {
        const { POSClient } = await import("@walletconnect/pos-client");
        const client = await POSClient.init({
          projectId: process.env.EXPO_PUBLIC_PROJECT_ID!,
          deviceId: "1234567890",
          metadata: {
            merchantName: "WPay",
            description: "WalletConnect Point of Sale",
            logoIcon:
              "https://raw.githubusercontent.com/reown-com/react-native-examples/refs/heads/main/dapps/pos-app/icon.png",
            url: "https://walletconnect.com",
          },
          loggerOptions: {
            posLevel: __DEV__ ? "debug" : "silent",
          },
        });

        console.log("POS Client initialized successfully");
        posClientRef.current = client;
        setIsInitialized(true);
      } catch (error) {
        console.error("Failed to initialize POSClient:", error);
      }
    }

    initializePOSClient();
  }, []);

  return (
    <GestureHandlerRootView>
      {/* <AppKitProvider instance={appKit}> */}
      {/* <WagmiProvider config={wagmiAdapter.wagmiConfig}> */}
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <POSProvider
            posClient={posClientRef.current}
            isInitialized={isInitialized}
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
                    paddingBottom: bottom,
                  },
                };
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="amount" />
              <Stack.Screen name="payment-method" />
              <Stack.Screen name="payment-token" />
              <Stack.Screen name="payment-network" />
              <Stack.Screen name="scan" />
              <Stack.Screen name="payment-failure" />
              <Stack.Screen
                name="payment-success"
                options={{
                  headerBackVisible: false,
                }}
              />
              <Stack.Screen name="address-not-set" />
              <Stack.Screen name="settings" />
              <Stack.Screen name="settings-address-list" />
              <Stack.Screen name="settings-update-address" />
              <Stack.Screen name="settings-scan-address" />
              <Stack.Screen name="settings-networks" />
            </Stack>
            <StatusBar style="auto" />
            {/* <AppKit /> */}
          </POSProvider>
          <Toast />
        </ThemeProvider>
      </QueryClientProvider>
      {/* </WagmiProvider> */}
      {/* </AppKitProvider> */}
    </GestureHandlerRootView>
  );
});
