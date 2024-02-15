import React from 'react';
import {ENV_SENTRY_DSN} from '@env';
import {NavigationContainer} from '@react-navigation/native';
import * as Sentry from '@sentry/react-native';

import {RootStackNavigator} from '../navigators/RootStackNavigator';
import {StatusBar} from 'react-native';
import {NotifyClientProvider} from '@/provider/NotifyClientProvider';

if (!__DEV__) {
  Sentry.init({
    dsn: ENV_SENTRY_DSN,
  });
}

const App = () => {
  return (
    <NavigationContainer>
      <NotifyClientProvider>
        <StatusBar barStyle={'dark-content'} />
        <RootStackNavigator />
      </NotifyClientProvider>
    </NavigationContainer>
  );
};

export default App;
