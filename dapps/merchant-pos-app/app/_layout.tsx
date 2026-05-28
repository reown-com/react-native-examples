import "@/utils/polyfills";

import {
  AppKit,
  AppKitProvider,
  createAppKit,
  solana,
} from "@reown/appkit-react-native";
import { SolanaAdapter } from "@reown/appkit-solana-react-native";
import { WagmiAdapter } from "@reown/appkit-wagmi-react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { arbitrum, base, mainnet, polygon } from "@wagmi/core/chains";
import * as Clipboard from "expo-clipboard";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import {
  initialWindowMetrics,
  SafeAreaProvider,
} from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { WagmiProvider } from "wagmi";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTheme } from "@/hooks/use-theme-color";
import { useMerchantStore } from "@/store/useMerchantStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { appkitStorage } from "@/utils/appkit-storage";
import { getInstallId } from "@/utils/install-id";

const queryClient = new QueryClient();

// Reown AppKit project id — https://dashboard.reown.com.
// The fallback id only works in Expo Go; set EXPO_PUBLIC_PROJECT_ID for production builds.
const projectId =
  process.env.EXPO_PUBLIC_PROJECT_ID ?? "b8e39dfb697ba26ac5a77a4b29b35604";

const metadata = {
  name: "Merchant POS",
  description: "Accept crypto payments. Settle to your wallet.",
  url: "https://reown.com/appkit",
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
  redirect: {
    native: "merchantpos://",
    universal: "",
  },
};

const evmNetworks = [mainnet, polygon, arbitrum, base];

const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: evmNetworks as any,
});

const solanaAdapter = new SolanaAdapter();

const clipboardClient = {
  setString: async (value: string) => {
    await Clipboard.setStringAsync(value);
  },
};

const appkit = createAppKit({
  projectId,
  networks: [...evmNetworks, solana],
  adapters: [wagmiAdapter, solanaAdapter],
  metadata,
  clipboardClient,
  storage: appkitStorage,
  defaultNetwork: mainnet,
  enableAnalytics: true,
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const Theme = useTheme();
  const merchantHydrated = useMerchantStore((s) => s._hasHydrated);
  const settingsHydrated = useSettingsStore((s) => s._hasHydrated);

  const [fontsLoaded] = useFonts({
    "KH Teka": require("@/assets/fonts/KHTeka-Regular.otf"),
    "KH Teka Light": require("@/assets/fonts/KHTeka-Light.otf"),
    "KH Teka Medium": require("@/assets/fonts/KHTeka-Medium.otf"),
  });

  // Ensure stores rehydrate even if no React subscriber triggers it.
  useEffect(() => {
    useMerchantStore.persist.rehydrate();
    useSettingsStore.persist.rehydrate();
    // Mint the persistent install id on first launch so it's ready when
    // onboarding finishes and we upsert the merchant.
    getInstallId();
  }, []);

  if (!fontsLoaded || !merchantHydrated || !settingsHydrated) {
    return <View style={{ flex: 1, backgroundColor: Theme["bg-primary"] }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <WagmiProvider config={wagmiAdapter.wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            <AppKitProvider instance={appkit}>
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: Theme["bg-primary"] },
                  animation: "slide_from_right",
                }}
              >
                <Stack.Screen name="index" />
                <Stack.Screen name="onboarding/business-details" />
                <Stack.Screen name="onboarding/networks" />
                <Stack.Screen name="onboarding/connect-wallet" />
                <Stack.Screen name="onboarding/verify" />
                <Stack.Screen name="onboarding/tokens" />
                <Stack.Screen name="home" />
                <Stack.Screen name="pos/amount" />
                <Stack.Screen name="pos/checkout" />
                <Stack.Screen
                  name="pos/success"
                  options={{ animation: "fade" }}
                />
                <Stack.Screen
                  name="pos/cancelled"
                  options={{ animation: "fade" }}
                />
                <Stack.Screen name="links/index" />
                <Stack.Screen name="activity" />
              </Stack>
              <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
              {/* Workaround for Android modal rendering:
                  https://github.com/expo/expo/issues/32991#issuecomment-2489620459 */}
              <View
                style={{ position: "absolute", height: "100%", width: "100%" }}
                pointerEvents="box-none"
              >
                <AppKit />
              </View>
              <Toast
                position="bottom"
                bottomOffset={initialWindowMetrics?.insets.bottom ?? 24}
                visibilityTime={2200}
              />
            </AppKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
