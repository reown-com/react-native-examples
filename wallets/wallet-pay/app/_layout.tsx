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
  useWalletKitListener,
} from '@/hooks/use-walletkit';
import { useWalletInitialization } from '@/hooks/use-wallet-initialization';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Colors } from '@/constants/theme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const Theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const walletReady = useWalletInitialization();
  useInitializeWalletKit(walletReady);

  useWalletKitListener('session_proposal', (args) => {
    console.log('session_proposal', args);
    router.push({
      pathname: '/session-proposal',
      params: { proposal: JSON.stringify(args) },
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
          </Stack>
          <StatusBar style="auto" />
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}
