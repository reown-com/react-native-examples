import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import "@walletconnect/react-native-compat";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import Toast from "react-native-toast-message";
import { WagmiProvider } from "wagmi";

import HeaderImage from "@/components/header-image";
import { POSProvider } from "@/context/POSContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useInitializePOS } from "@/hooks/use-initialize-pos";
import { useTheme } from "@/hooks/use-theme-color";
import { appKit, wagmiAdapter } from "@/utils/appkit";
import { AppKit, AppKitProvider } from "@reown/appkit-react-native";
import * as Sentry from "@sentry/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  spotlight: __DEV__,
});

const queryClient = new QueryClient();

export default Sentry.wrap(function RootLayout() {
  const colorScheme = useColorScheme();
  const Theme = useTheme();
  const { posClient, isInitialized } = useInitializePOS({
    projectId: process.env.EXPO_PUBLIC_PROJECT_ID!,
    deviceId: "1234567890",
    metadata: {
      merchantName: "Mobile POS Terminal",
      description: "Mobile Point of Sale Terminal",
      logoIcon: "https://avatars.githubusercontent.com/u/179229932",
      url: "https://reown.com/appkit",
    },
    loggerOptions: {
      posLevel: "debug",
    },
  });

  return (
    <AppKitProvider instance={appKit}>
      <WagmiProvider config={wagmiAdapter.wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider
            value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
          >
            <POSProvider posClient={posClient} isInitialized={isInitialized}>
              <Stack
                screenOptions={({ route }) => {
                  const isPaymentSuccess = route.name === "payment-success";
                  const headerBackgroundColor = isPaymentSuccess
                    ? Theme["text-success"]
                    : Theme["bg-primary"];

                  const headerTintColor = isPaymentSuccess
                    ? Theme["text-invert"]
                    : Theme["text-primary"];
                  return {
                    headerTitle: HeaderImage,
                    headerShadowVisible: false,
                    headerTintColor,
                    headerBackButtonDisplayMode: "minimal",
                    headerTitleAlign: "center",
                    headerStyle: {
                      backgroundColor: headerBackgroundColor,
                    },
                    contentStyle: {
                      backgroundColor: Theme["bg-primary"],
                    },
                  };
                }}
              >
                <Stack.Screen name="index" />
                <Stack.Screen
                  name="settings"
                  options={{
                    title: "",
                  }}
                />
                <Stack.Screen name="amount" />
                <Stack.Screen name="payment-method" />
                <Stack.Screen name="payment-token" />
                <Stack.Screen name="payment-network" />
                <Stack.Screen name="scan" />
                <Stack.Screen
                  name="payment-success"
                  options={{
                    headerBackVisible: false,
                  }}
                />
              </Stack>
              <StatusBar style="auto" />
              <AppKit />
            </POSProvider>
            <Toast />
          </ThemeProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </AppKitProvider>
  );
});
