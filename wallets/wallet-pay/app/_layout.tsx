import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import '@walletconnect/react-native-compat';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  useInitializeWalletKit,
  useWalletKitListener,
} from '@/hooks/use-walletkit';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  useInitializeWalletKit();

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
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="scanner"
            options={{ headerShown: false, presentation: 'card' }}
          />
          <Stack.Screen
            name="modal"
            options={{
              presentation: 'formSheet',
              title: 'Modal',
            }}
          />
          <Stack.Screen
            name="session-proposal"
            options={{
              presentation: 'formSheet',
              headerShown: false,
            }}
          />
        </Stack>
        <StatusBar style="auto" />
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}
