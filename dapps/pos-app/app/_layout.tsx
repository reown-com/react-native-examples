import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import "@walletconnect/react-native-compat";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: false,

  // Enable Logs
  enableLogs: __DEV__ ? true : false,

  // Configure Session Replay
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
  integrations: [],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  spotlight: __DEV__,
});

const queryClient = new QueryClient();

export default Sentry.wrap(function RootLayout() {
  const { bottom } = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const Theme = useTheme();
  const { posClient, isInitialized } = useInitializePOS({
    projectId: process.env.EXPO_PUBLIC_PROJECT_ID!,
    deviceId: "1234567890",
    metadata: {
      merchantName: "WPay",
      description: "WalletConnect Point of Sale",
      logoIcon:
        "https://raw.githubusercontent.com/reown-com/react-native-examples/refs/heads/main/dapps/pos-app/assets/images/icon.png",
      url: "https://reown.com/appkit",
    },
    loggerOptions: {
      posLevel: __DEV__ ? "debug" : "silent",
    },
  });

  return (
    <GestureHandlerRootView>
      <AppKitProvider instance={appKit}>
        <WagmiProvider config={wagmiAdapter.wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider
              value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
            >
              <POSProvider posClient={posClient} isInitialized={isInitialized}>
                <Stack
                  screenOptions={({ route }) => {
                    const centerTitle =
                      route.name === "index" ||
                      route.name === "payment-success";
                    const isPaymentSuccess = route.name === "payment-success";
                    const headerBackgroundColor = isPaymentSuccess
                      ? Theme["text-success"]
                      : Theme["bg-primary"];

                    const headerTintColor = isPaymentSuccess
                      ? Theme["text-invert"]
                      : Theme["text-primary"];

                    return {
                      headerTitle: centerTitle ? HeaderImage : "",
                      headerRight: !centerTitle
                        ? () => (
                            <HeaderImage padding tintColor={headerTintColor} />
                          )
                        : undefined,
                      headerShadowVisible: false,
                      headerTintColor,
                      headerBackButtonDisplayMode: "minimal",
                      headerTitleAlign: "center",
                      headerStyle: {
                        backgroundColor: headerBackgroundColor,
                      },
                      contentStyle: {
                        backgroundColor: Theme["bg-primary"],
                        paddingBottom: bottom,
                      },
                    };
                  }}
                >
                  <Stack.Screen name="index" />
                  <Stack.Screen name="settings" />
                  <Stack.Screen name="settings-recipient" />
                  <Stack.Screen name="settings-address" />
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
                </Stack>
                <StatusBar style="auto" />
                <AppKit />
              </POSProvider>
              <Toast />
            </ThemeProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </AppKitProvider>
    </GestureHandlerRootView>
  );
});
