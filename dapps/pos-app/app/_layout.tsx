import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import '@walletconnect/react-native-compat';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { KeyboardProvider } from "react-native-keyboard-controller";
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';

import { POSProvider } from '@/context/POSContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useInitializePOS } from '@/hooks/use-initialize-pos';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { posClient, isInitialized } = useInitializePOS({
    projectId: process.env.EXPO_PUBLIC_PROJECT_ID!,
    deviceId: '1234567890',
    metadata: {
      merchantName: "Crypto POS Terminal",
      logoIcon: "https://appkit.reown.com/metadata-icon.svg",
      description: "Professional Point of Sale Terminal",
      url: "https://appkit.reown.com",
    },
    loggerOptions: {
      posLevel: "debug",
    }
  });

  return (
    <KeyboardProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <POSProvider posClient={posClient} isInitialized={isInitialized}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="payment" options={{ presentation: 'card', title: 'Create Payment', headerBackButtonDisplayMode: 'minimal' }} />
            <Stack.Screen name="qr-modal" options={{ presentation: 'modal', title: 'Payment Request' }} />
          </Stack>
          <StatusBar style="auto" />
        </POSProvider>
        <Toast />
      </ThemeProvider>
    </KeyboardProvider>
  );
}
