import 'react-native-get-random-values';
import '@ethersproject/shims';
import React from 'react';
import {SafeAreaView, StyleSheet, useColorScheme, View} from 'react-native';
import '@walletconnect/react-native-compat';
import {Web3Button, Web3Modal} from '@web3modal/react-native';

// @ts-expect-error - `@env` is a virtualised module via Babel config.
import {ENV_PROJECT_ID} from '@env';

import {DarkTheme, LightTheme} from '../constants/Colors';

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundColor = isDarkMode
    ? DarkTheme.background2
    : LightTheme.background2;

  return (
    <SafeAreaView style={[styles.safeArea, {backgroundColor}]}>
      <View style={[styles.container, {backgroundColor}]}>
        <Web3Button />
        <Web3Modal projectId={ENV_PROJECT_ID} />
      </View>
    </SafeAreaView>
  );
}

export default App;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
});
