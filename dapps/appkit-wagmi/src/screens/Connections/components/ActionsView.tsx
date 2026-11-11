
import React from 'react';
import { StyleSheet } from 'react-native';
import { Button, FlexView } from '@reown/appkit-ui-react-native';
import { useAccount, useAppKit } from '@reown/appkit-react-native';

import { SolanaActionsView } from './SolanaActionsView';
import { BitcoinActionsView } from './BitcoinActionsView';
import { WagmiActionsView } from './WagmiActionsView';

export function ActionsView() {
  const { namespace, isConnected } = useAccount();
  const { disconnect } = useAppKit();

  return isConnected ? (
    <FlexView style={styles.container}>
      {namespace === 'eip155' ? (
        <WagmiActionsView />
      ) : namespace === 'solana' ? (
        <SolanaActionsView />
      ) : namespace === 'bip122' ? (
        <BitcoinActionsView />
      ) : null}
      {/* One-tap disconnect; the WalletKit connect E2E flows use it to reset
          the dApp between runs (.maestro/flows/connect_disconnect_dapp.yaml). */}
      <Button testID="disconnect-button" variant="accent" onPress={() => disconnect()}>
        Disconnect
      </Button>
    </FlexView>
  ) : null;
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    gap: 8,
  },
});
