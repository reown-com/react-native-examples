import '@walletconnect/react-native-compat';
import React, {useEffect} from 'react';
import {View} from 'react-native';
import {W3mButton} from '@web3modal/wagmi-react-native';

import {FlexView, Text} from '@web3modal/ui-react-native';
import {SignMessage} from '../views/SignMessage';
import {SendTransaction} from '../views/SendTransaction';
import {ReadContract} from '../views/ReadContract';
import {WriteContract} from '../views/WriteContract';
import {InitializeNotifyClientButton} from '../components/InitializeNotifyClientButton';
import {useAccount} from 'wagmi';

export default function ConnectScreen() {
  const {address} = useAccount();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <FlexView>
        <W3mButton balance="show" />
        <InitializeNotifyClientButton />
        <SignMessage />
        <SendTransaction />
        <ReadContract />
        <WriteContract />
      </FlexView>
    </View>
  );
}
