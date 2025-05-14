import React from 'react';
import {StyleSheet, View} from 'react-native';
import {AppKitButton} from '@reown/appkit-react-native';
import {FlexView, Text} from '@reown/appkit-ui-react-native';

import {ActionsView} from './components/ActionsView';
import { EventsView } from './components/EventsView';
import { WalletInfoView } from './components/WalletInfoView';
function ConnectionsScreen() {
  return (
    <FlexView flexGrow={1} justifyContent="center" alignItems="center">
      <Text style={styles.title} center variant="large-600">
        AppKit + Multichain
      </Text>
      <View style={styles.buttonContainer}>
        <WalletInfoView />
        <AppKitButton balance="show" />
        <ActionsView />
        <EventsView />
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
