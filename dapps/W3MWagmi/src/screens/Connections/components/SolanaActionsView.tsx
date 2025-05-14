import React from 'react';
import { StyleSheet } from 'react-native';
import { Button, Text, FlexView } from '@reown/appkit-ui-react-native';
import { useAccount, useProvider } from '@reown/appkit-react-native';
import base58 from 'bs58';

import { ToastUtils } from '@/utils/ToastUtils';

export function SolanaActionsView() {
  const isConnected = true;
  const { address, chainId } = useAccount();
  const provider = useProvider('solana');

  const onSignSuccess = (data: any) => {
    ToastUtils.showSuccessToast('Sign successful', data);
  };

  const onSignError = (error: Error) => {
    ToastUtils.showErrorToast('Sign failed', error.message);
  };

  const signMessage = async () => {
    try {
      if (!provider) {
        ToastUtils.showErrorToast('Sign failed', 'No provider found');

        return;
      }

      if (!address) {
        ToastUtils.showErrorToast('Sign failed', 'No address found');

        return;
      }
      const encodedMessage = new TextEncoder().encode('Hello from AppKit Solana');

      const params = {
        message: base58.encode(encodedMessage),
        pubkey: address,
      };

      const { signature } = (await provider.request(
        {
          method: 'solana_signMessage',
          params,
        },
        chainId
      )) as { address: string; signature: string };

      onSignSuccess(signature);
    } catch (error) {
      onSignError(error as Error);
    }
  };

  return isConnected ? (
    <FlexView style={styles.container}>
      <Text variant="medium-600">Solana Actions</Text>
      <Button testID="sign-message-button" onPress={signMessage}>
        Sign
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
