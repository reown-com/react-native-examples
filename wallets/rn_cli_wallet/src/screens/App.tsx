import React from 'react';
import {ENV_SENTRY_DSN} from '@env';
import {NavigationContainer} from '@react-navigation/native';
import * as Sentry from '@sentry/react-native';

import {RootStackNavigator} from '../navigators/RootStackNavigator';

if (!__DEV__) {
  Sentry.init({
    dsn: ENV_SENTRY_DSN,
  });
}

const App = () => {
  return (
    <NavigationContainer>
      <RootStackNavigator />
    </NavigationContainer>
  );
};

export default App;
