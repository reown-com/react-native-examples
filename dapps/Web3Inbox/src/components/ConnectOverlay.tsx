import {W3mButton} from '@web3modal/wagmi-react-native';
import * as React from 'react';
import {Text} from 'react-native';

export default function ConnectOverlay() {
  return (
    <React.Fragment>
      <Text>Connect</Text>
      <Text>Connect your wallet to list your notifications</Text>
      <W3mButton />
    </React.Fragment>
  );
}
