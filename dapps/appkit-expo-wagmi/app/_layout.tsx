import 'text-encoding';
import "@walletconnect/react-native-compat";
import {
  AppKitProvider,
  bitcoin,
  createAppKit,
  solana,
} from "@reown/appkit-react-native";
import { WagmiAdapter } from "@reown/appkit-wagmi-react-native";
import { SolanaAdapter } from "@reown/appkit-solana-react-native";
import { BitcoinAdapter } from "@reown/appkit-bitcoin-react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { arbitrum, mainnet, polygon } from "@wagmi/core/chains";
import { WagmiProvider } from "wagmi";

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { storage } from "@/utils/StorageUtil";

// 0. Setup queryClient
const queryClient = new QueryClient();

// 1. Get projectId at https://dashboard.reown.com
const projectId = "YOUR_PROJECT_ID";

// 2. Create config
const metadata = {
  name: "AppKit RN",
  description: "AppKit RN Example",
  url: "https://reown.com/appkit",
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
  redirect: {
    native: "YOUR_APP_SCHEME://",
    universal: "YOUR_APP_UNIVERSAL_LINK.com",
  },
};

const networks = [mainnet, polygon, arbitrum];

const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: networks as any,
});

const solanaAdapter = new SolanaAdapter();
const bitcoinAdapter = new BitcoinAdapter();

// 3. Create modal
const appkit =createAppKit({
  projectId,
  networks: [...networks, solana, bitcoin],
  adapters: [wagmiAdapter, solanaAdapter, bitcoinAdapter],
  metadata,
  storage,
  defaultNetwork: mainnet, // Optional
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <WagmiProvider config={wagmiAdapter.wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <AppKitProvider instance={appkit}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
          </AppKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
}
