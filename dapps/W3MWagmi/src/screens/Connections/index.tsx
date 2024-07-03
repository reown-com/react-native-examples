import React from 'react';
import {StyleSheet, View} from 'react-native';
import {W3mButton} from '@web3modal/wagmi-react-native';
import {FlexView, Text} from '@web3modal/ui-react-native';

import {SignMessage} from './components/SignMessage';
import {SendTransaction} from './components/SendTransaction';
import {SignTypedDataV4} from './components/SignTypedDataV4';
import {ReadContract} from './components/ReadContract';
import {WriteContract} from './components/WriteContract';

function ConnectionsScreen() {
  return (
    <FlexView flexGrow={1} justifyContent="center" alignItems="center">
      <Text style={styles.title} center variant="large-600">
        Appkit + wagmi
      </Text>
      <View style={styles.buttonContainer}>
        <W3mButton balance="show" />
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
