import {useEffect} from 'react';
import Config from 'react-native-config';
import {StatusBar, useColorScheme} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import * as Sentry from '@sentry/react-native';
import BootSplash from 'react-native-bootsplash';
import {RELAYER_EVENTS} from '@walletconnect/core';

import {RootStackNavigator} from '@/navigators/RootStackNavigator';
import useInitializeWeb3Wallet from '@/hooks/useInitializeWeb3Wallet';
import useWalletConnectEventsManager from '@/hooks/useWalletConnectEventsManager';
import {web3wallet} from '@/utils/WalletConnectUtil';
import SettingsStore from '@/store/SettingsStore';

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
        console.log('Network connection is restored!');
      });

      web3wallet.core.relayer.on(RELAYER_EVENTS.disconnect, () => {
        console.log('Network connection lost.');
      });
    }
  }, [initialized]);

  useEffect(() => {
    /**
     * Empty promise that resolves after web3wallet is initialized
     * Usefull for cold starts
     */
    SettingsStore.setInitPromise();
  }, []);

  return (
    <NavigationContainer>
      <StatusBar
        barStyle={scheme === 'light' ? 'dark-content' : 'light-content'}
      />
      <RootStackNavigator />
    </NavigationContainer>
  );
};

export default App;
