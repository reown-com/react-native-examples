import React from 'react';
import Config from 'react-native-config';
import '@walletconnect/react-native-compat';
import {StatusBar, useColorScheme} from 'react-native';

import {NavigationContainer} from '@react-navigation/native';
import * as Sentry from '@sentry/react-native';

import {RootStackNavigator} from '../navigators/RootStackNavigator';
import {NotifyClientProvider} from '../provider/NotifyClientProvider';

if (!__DEV__ && Config.ENV_SENTRY_DSN) {
  Sentry.init({
    dsn: Config.ENV_SENTRY_DSN,
    environment: Config.ENV_SENTRY_TAG,
  });
}

const App = () => {
  const scheme = useColorScheme();

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
