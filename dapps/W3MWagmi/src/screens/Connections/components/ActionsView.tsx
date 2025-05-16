
import React from 'react';
import { StyleSheet } from 'react-native';
import { FlexView } from '@reown/appkit-ui-react-native';
import { useAccount } from '@reown/appkit-react-native';

import { SolanaActionsView } from './SolanaActionsView';
import { BitcoinActionsView } from './BitcoinActionsView';
import { WagmiActionsView } from './WagmiActionsView';
// import { EthersActionsView } from './EthersActionsView';

export function ActionsView() {
  const { chainId } = useAccount();
  const isConnected = !!chainId;

  return isConnected ? (
    <FlexView style={styles.container}>
      {chainId?.startsWith('eip155') ? (
        <WagmiActionsView />
      ) : chainId?.startsWith('solana') ? (
        <SolanaActionsView />
      ) : chainId?.startsWith('bip122') ? (
        <BitcoinActionsView />
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
