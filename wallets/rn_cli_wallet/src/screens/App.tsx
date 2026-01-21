import { useCallback, useEffect } from 'react';
import Config from 'react-native-config';
import { Linking, Platform, StatusBar } from 'react-native';
import { useSnapshot } from 'valtio';
import { NavigationContainer } from '@react-navigation/native';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import * as Sentry from '@sentry/react-native';
import BootSplash from 'react-native-bootsplash';
import Toast from 'react-native-toast-message';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RELAYER_EVENTS } from '@walletconnect/core';

import { RootStackNavigator } from '@/navigators/RootStackNavigator';
import useInitializeWalletKit from '@/hooks/useInitializeWalletKit';
import useWalletKitEventsManager from '@/hooks/useWalletKitEventsManager';
import { walletKit } from '@/utils/WalletKitUtil';
import SettingsStore from '@/store/SettingsStore';
import ModalStore from '@/store/ModalStore';
import { SENTRY_TAG } from '@/utils/misc';
import { toastConfig } from '@/components/ToastConfig';

Sentry.init({
  enabled: !__DEV__ && !!Config.ENV_SENTRY_DSN,
  dsn: Config.ENV_SENTRY_DSN,
  environment: SENTRY_TAG,
  sendDefaultPii: true,
  // Enable Logs
  enableLogs: true,

  // Temporarily disable native for Android, not sure why it's not working
  enableNative: Platform.OS === 'ios',

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,

  tracesSampleRate: 0.5,
  profilesSampleRate: 1.0,
  integrations: [Sentry.mobileReplayIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

const App = () => {
  const { themeMode, eip155Address } = useSnapshot(SettingsStore.state);

  // Load saved theme mode on startup
  useEffect(() => {
    SettingsStore.loadThemeMode();
  }, []);

  // Step 1 - Initialize wallets and wallet connect client
  const initialized = useInitializeWalletKit();

  // Step 2 - Once initialized, set up wallet connect event manager
  useWalletKitEventsManager(initialized);

  // Hide splash screen once wallets are initialized, addresses are loaded and theme mode is set
  useEffect(() => {
    if (initialized && eip155Address && themeMode) {
      BootSplash.hide({ fade: true });
    }
  }, [initialized, eip155Address, themeMode]);

  // Set up relayer event listeners once initialized
  useEffect(() => {
    if (initialized) {
      walletKit.core.relayer.on(RELAYER_EVENTS.connect, () => {
        SettingsStore.setSocketStatus('connected');
      });
      walletKit.core.relayer.on(RELAYER_EVENTS.disconnect, () => {
        Toast.show({
          type: 'error',
          text1: 'Network connection lost.',
        });
        SettingsStore.setSocketStatus('disconnected');
      });
      walletKit.core.relayer.on(RELAYER_EVENTS.connection_stalled, () => {
        SettingsStore.setSocketStatus('stalled');
      });
    }
  }, [initialized]);

  const pair = useCallback(async (uri: string) => {
    try {
      ModalStore.open('LoadingModal', { loadingMessage: 'Preparing connection...' });

      await SettingsStore.state.initPromise;
      await walletKit.pair({ uri });
    } catch (error: any) {
      ModalStore.open('LoadingModal', {
        errorMessage: error?.message || 'There was an error pairing',
      });
    }
  }, []);

  const deeplinkHandler = useCallback(
    ({ url }: { url: string }) => {
      const isLinkMode = url.includes('wc_ev');
      SettingsStore.setIsLinkModeRequest(isLinkMode);

      if (isLinkMode) {
        return;
      } else if (url.includes('wc?uri=')) {
        const uri = url.split('wc?uri=')[1];
        pair(decodeURIComponent(uri));
      } else if (url.includes('wc:')) {
        pair(url);
      } else if (url.includes('wc?')) {
        ModalStore.open('LoadingModal', {
          loadingMessage: 'Loading request...',
        });
      }
    },
    [pair],
  );

  useEffect(() => {
    /**
     * Empty promise that resolves after WalletKit is initialized
     * Usefull for cold starts
     */
    SettingsStore.setInitPromise();
  }, []);

  // Check if app was opened from a link-mode request
  useEffect(() => {
    SettingsStore.setInitPromise();

    async function checkInitialUrl() {
      const initialUrl = await Linking.getInitialURL();
      if (!initialUrl) {
        return;
      }

      deeplinkHandler({ url: initialUrl });
    }

    const sub = Linking.addEventListener('url', deeplinkHandler);

    checkInitialUrl();
    return () => sub.remove();
  }, [deeplinkHandler]);

  return (
    <SafeAreaProvider>
      <KeyboardProvider>
        <NavigationContainer>
          <StatusBar
            translucent={true}
            barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
          />
          <RootStackNavigator />
          <Toast
            config={toastConfig}
            position="top"
            topOffset={0}
          />
        </NavigationContainer>
      </KeyboardProvider>
    </SafeAreaProvider>
  );
};

export default Sentry.wrap(App);
