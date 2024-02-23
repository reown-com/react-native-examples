import '@walletconnect/react-native-compat';

import React from 'react';
import {StatusBar, useColorScheme} from 'react-native';

import {ENV_SENTRY_DSN} from '@env';
import {NavigationContainer} from '@react-navigation/native';
import * as Sentry from '@sentry/react-native';

import {RootStackNavigator} from '../navigators/RootStackNavigator';
import {NotifyClientProvider} from '../provider/NotifyClientProvider';

if (!__DEV__) {
  Sentry.init({
    dsn: ENV_SENTRY_DSN,
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
