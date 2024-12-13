import React from 'react';
import {StyleSheet, View} from 'react-native';
import {AppKitButton} from '@reown/appkit-wagmi-react-native';
import {FlexView, Text} from '@reown/appkit-ui-react-native';

import {SignMessage} from './components/SignMessage';
import {SendTransaction} from './components/SendTransaction';
import {SignTypedDataV4} from './components/SignTypedDataV4';
import {ReadContract} from './components/ReadContract';
import {WriteContract} from './components/WriteContract';

function ConnectionsScreen() {
  return (
    <FlexView flexGrow={1} justifyContent="center" alignItems="center">
      <Text style={styles.title} center variant="large-600">
        AppKit + wagmi
      </Text>
      <View style={styles.buttonContainer}>
        <AppKitButton balance="show" />
        <SignMessage />
        <SendTransaction />
        <SignTypedDataV4 />
        <ReadContract />
        <WriteContract />
      </View>
    </FlexView>
  );
}

export default ConnectionsScreen;

const styles = StyleSheet.create({
  title: {
    marginBottom: 40,
    fontSize: 30,
  },
  buttonContainer: {
    gap: 8,
  },
});
