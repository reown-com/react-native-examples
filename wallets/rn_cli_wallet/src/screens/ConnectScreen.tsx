import '@walletconnect/react-native-compat';

import React from 'react';
import {View} from 'react-native';

import {InitializeNotifyClientButton} from '@/components/components/InitializeNotifyClientButton';

export default function ConnectScreen() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <InitializeNotifyClientButton />
    </View>
  );
}
