import 'text-encoding';
import "@walletconnect/react-native-compat";
import {
  AppKit,
  AppKitProvider,
  bitcoin,
  createAppKit,
  solana,
} from "@reown/appkit-react-native";
import { WagmiAdapter } from "@reown/appkit-wagmi-react-native";
import { SolanaAdapter, PhantomConnector, SolflareConnector } from "@reown/appkit-solana-react-native";
import { BitcoinAdapter } from "@reown/appkit-bitcoin-react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { arbitrum, mainnet, polygon } from "@wagmi/core/chains";
import { WagmiProvider } from "wagmi";

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import * as Clipboard from 'expo-clipboard';

import { useColorScheme } from '@/hooks/useColorScheme';
import { storage } from "@/utils/StorageUtil";
import { View } from 'react-native';

const clipboardClient = {
  setString: async (value: string) => {
    Clipboard.setStringAsync(value);
  },
};

// 0. Setup queryClient
const queryClient = new QueryClient();

// 1. Get projectId at https://dashboard.reown.com
const projectId = "b8e39dfb697ba26ac5a77a4b29b35604"; // This project ID will only work for Expo Go. Use your own project ID for production.



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
const appkit = createAppKit({
  projectId,
  networks: [...networks, solana, bitcoin],
  adapters: [wagmiAdapter, solanaAdapter, bitcoinAdapter],
  extraConnectors: [new PhantomConnector(), new SolflareConnector()],
  metadata,
  clipboardClient,
  storage,
  defaultNetwork: mainnet, // Optional
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    KHTeka: require('../assets/fonts/KHTeka-Regular.otf'),
    KHTekaMedium: require('../assets/fonts/KHTeka-Medium.otf'),
    KHTekaMono: require('../assets/fonts/KHTekaMono-Regular.otf'),
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
          {/* This is a workaround for the Android modal issue. https://github.com/expo/expo/issues/32991#issuecomment-2489620459 */}
          <View style={{ position: "absolute", height: "100%", width: "100%" }}>
            <AppKit />
          </View>
          </AppKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
}
