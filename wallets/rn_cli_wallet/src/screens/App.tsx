import React, {useEffect} from 'react';
import Config from 'react-native-config';
import '@walletconnect/react-native-compat';
import {StatusBar, useColorScheme} from 'react-native';

import {NavigationContainer} from '@react-navigation/native';
import * as Sentry from '@sentry/react-native';
import BootSplash from 'react-native-bootsplash';

import {RootStackNavigator} from '../navigators/RootStackNavigator';
import {NotifyClientProvider} from '../provider/NotifyClientProvider';
import useInitializeWeb3Wallet from '@/hooks/useInitializeWeb3Wallet';
// import {useInitializeNotifyClient} from '@/hooks/useInitializeNotifyClient';
import useWalletConnectEventsManager from '@/hooks/useWalletConnectEventsManager';
import {web3wallet} from '@/utils/WalletConnectUtil';
import {RELAYER_EVENTS} from '@walletconnect/core';

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

  // Step 2 - Initialize Notify Client
  // useInitializeNotifyClient();

  // Step 3 - Once initialized, set up wallet connect event manager
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

  return (
    <NavigationContainer>
      <NotifyClientProvider>
        <StatusBar
          barStyle={scheme === 'light' ? 'dark-content' : 'light-content'}
        />
        <RootStackNavigator />
      </NotifyClientProvider>
    </NavigationContainer>
  );
};

export default App;
