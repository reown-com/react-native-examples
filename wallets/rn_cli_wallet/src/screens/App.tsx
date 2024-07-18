import {useCallback, useEffect} from 'react';
import Config from 'react-native-config';
import {Linking, Platform, StatusBar, useColorScheme} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import * as Sentry from '@sentry/react-native';
import BootSplash from 'react-native-bootsplash';
import Toast from 'react-native-toast-message';
import {RELAYER_EVENTS} from '@walletconnect/core';

import {RootStackNavigator} from '@/navigators/RootStackNavigator';
import useInitializeWeb3Wallet from '@/hooks/useInitializeWeb3Wallet';
import useWalletConnectEventsManager from '@/hooks/useWalletConnectEventsManager';
import {web3wallet} from '@/utils/WalletConnectUtil';
import SettingsStore from '@/store/SettingsStore';
import ModalStore from '@/store/ModalStore';

if (!__DEV__ && Config.ENV_SENTRY_DSN) {
  Sentry.init({
    dsn: Config.ENV_SENTRY_DSN,
    environment: Config.ENV_SENTRY_TAG,
  });
}

const App = () => {
  const scheme = useColorScheme();

  // Step 1 - Initialize wallets and wallet connect client
  const initialized = useInitializeWeb3Wallet();

  // Step 2 - Once initialized, set up wallet connect event manager
  useWalletConnectEventsManager(initialized);

  useEffect(() => {
    if (initialized) {
      BootSplash.hide({fade: true});

      web3wallet.core.relayer.on(RELAYER_EVENTS.connect, () => {
        Toast.show({
          type: 'success',
          text1: 'Network connection is restored!',
        });
        SettingsStore.setSocketStatus('connected');
      });
      web3wallet.core.relayer.on(RELAYER_EVENTS.disconnect, () => {
        Toast.show({
          type: 'error',
          text1: 'Network connection lost.',
        });
        SettingsStore.setSocketStatus('disconnected');
      });
      web3wallet.core.relayer.on(RELAYER_EVENTS.connection_stalled, () => {
        Toast.show({
          type: 'error',
          text1: 'Network connection stalled.',
        });
        SettingsStore.setSocketStatus('stalled');
      });
    }
  }, [initialized]);

  const pair = useCallback(async (uri: string) => {
    try {
      ModalStore.open('LoadingModal', {loadingMessage: 'Pairing...'});

      await SettingsStore.state.initPromise;
      await web3wallet.pair({uri});
    } catch (error: any) {
      ModalStore.open('LoadingModal', {
        errorMessage: error?.message || 'There was an error pairing',
      });
    }
  }, []);

  const deeplinkHandler = useCallback(
    ({url}: {url: string}) => {
      const isLinkMode = url.includes('wc_ev');
      SettingsStore.setCurrentRequestLinkMode(isLinkMode);

      if (isLinkMode) {
        ModalStore.open('LoadingModal', {loadingMessage: 'Loading request...'});
      } else if (url.includes('wc?uri=')) {
        const uri = url.split('wc?uri=')[1];
        pair(decodeURIComponent(uri));
      } else if (url.includes('wc:')) {
        pair(url);
      } else if (url.includes('wc?')) {
        ModalStore.open('LoadingModal', {loadingMessage: 'Loading request...'});
      }
    },
    [pair],
  );

  useEffect(() => {
    /**
     * Empty promise that resolves after web3wallet is initialized
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

      deeplinkHandler({url: initialUrl});
    }

    const sub = Linking.addEventListener('url', deeplinkHandler);

    checkInitialUrl();
    return () => sub.remove();
  }, [deeplinkHandler]);

  return (
    <NavigationContainer>
      <StatusBar
        barStyle={scheme === 'light' ? 'dark-content' : 'light-content'}
      />
      <RootStackNavigator />
      <Toast
        position="top"
        topOffset={Platform.select({ios: 80, android: 0})}
      />
    </NavigationContainer>
  );
};

export default App;
