import React from 'react';
import {StyleSheet} from 'react-native';
import {FlexView} from '@reown/appkit-ui-react-native';
import {useAccount} from '@reown/appkit-react-native';

import {SolanaActionsView} from './SolanaActionsView';
import {EthersActionsView} from './EthersActionsView';

export function ActionsView() {
  const {chainId, namespace} = useAccount();
  const isConnected = !!chainId;

  return isConnected ? (
    <FlexView style={styles.container}>
      {namespace === 'eip155' ? (
        <EthersActionsView />
      ) : namespace === 'solana' ? (
        <SolanaActionsView />
      ) : null}
    </FlexView>
  ) : null;
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    gap: 8,
  },
});
