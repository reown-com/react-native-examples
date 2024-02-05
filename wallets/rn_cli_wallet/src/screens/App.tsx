import React from 'react';
import {ENV_SENTRY_DSN} from '@env';
import {NavigationContainer} from '@react-navigation/native';
import * as Sentry from '@sentry/react-native';

import {RootStackNavigator} from '../navigators/RootStackNavigator';
import {StatusBar} from 'react-native';

if (!__DEV__) {
  Sentry.init({
    dsn: ENV_SENTRY_DSN,
  });
}

const App = () => {
  return (
    <NavigationContainer>
      <StatusBar barStyle={'dark-content'} />
      <RootStackNavigator />
    </NavigationContainer>
  );
};

export default App;
