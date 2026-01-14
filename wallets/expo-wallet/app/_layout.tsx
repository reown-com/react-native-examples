// Polyfills MUST be imported first
import '@/utils/polyfills';

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  useInitializeWalletKit,
  useWalletKit,
  useWalletKitListener,
} from '@/hooks/use-walletkit';
import { useWalletInitialization } from '@/hooks/use-wallet-initialization';
import { useInitializePaySDK } from '@/hooks/use-initialize-pay-sdk';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Colors } from '@/constants/theme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const Theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const { isReady: walletReady } = useWalletInitialization();
  useInitializeWalletKit(walletReady);
  const { walletKit } = useWalletKit();

  // Initialize WalletConnect Pay SDK
  useInitializePaySDK();

  useWalletKitListener('session_proposal', (args) => {
    if (__DEV__) {
      console.log('session_proposal', args);
    }
    router.push({
      pathname: '/session-proposal',
      params: { proposal: JSON.stringify(args) },
    });
  });

  useWalletKitListener('session_request', (args) => {
    if (__DEV__) {
      console.log('session_request', args);
    }
    const session = walletKit?.getActiveSessions()[args.topic];
    if (!session) {
      console.error('Session not found for topic:', args.topic);
      return;
    }
    router.push({
      pathname: '/session-request',
      params: {
        requestEvent: JSON.stringify(args),
        session: JSON.stringify(session),
        verifyContext: JSON.stringify(args.verifyContext),
      },
    });
  });

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <GestureHandlerRootView>
        <BottomSheetModalProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: Theme['bg-primary'] },
            }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="scanner"
              options={{ headerShown: false, presentation: 'card' }}
            />
            <Stack.Screen
              name="session-proposal"
              options={{
                presentation: 'transparentModal',
                animation: 'none',
                headerShown: false,
                contentStyle: { backgroundColor: 'transparent' },
              }}
            />
            <Stack.Screen
              name="session-request"
              options={{
                presentation: 'transparentModal',
                animation: 'none',
                headerShown: false,
                contentStyle: { backgroundColor: 'transparent' },
              }}
            />
            <Stack.Screen
              name="pay"
              options={{
                presentation: 'transparentModal',
                animation: 'none',
                headerShown: false,
                contentStyle: { backgroundColor: 'transparent' },
              }}
            />
          </Stack>
          <StatusBar style="auto" />
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}
