import React from 'react';
import { StyleSheet } from 'react-native';
import { Button, Text, FlexView } from '@reown/appkit-ui-react-native';
import { useAccount, useProvider } from '@reown/appkit-react-native';
import { hexlify, isHexString, toUtf8Bytes } from 'ethers';

import { ToastUtils } from '@/utils/ToastUtils';

export function EthersActionsView() {
  const isConnected = true;
  const { address, chainId } = useAccount();
  const {provider} = useProvider('eip155');

  const onSuccess = (data: any) => {
    ToastUtils.showSuccessToast('Sign successful', data);
  };

  const onError = (error: Error) => {
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

      const message = 'Hello from AppKit Ethers';
      const hexMessage = isHexString(message) ? message : hexlify(toUtf8Bytes(message));

      const signature = await provider.request(
        {
          method: 'personal_sign',
          params: [hexMessage, address],
        },
        chainId
      );

      onSuccess(signature);
    } catch (error) {

      console.log('error', error);
      onError(error as Error);
    }
  };

  const sendTransaction = async () => {
    try {
      if (!provider) {
        ToastUtils.showErrorToast('Send Transaction failed', 'No provider found');
        return;
      }

      const tx = await provider.request({
        method: 'eth_sendTransaction',
        params: [{ from: address, to: address, value: '0x1' }],
      });

      onSuccess(tx);
    } catch (error) {
      console.log('error', error);
      onError(error as Error);
    }
  };

  return isConnected ? (
    <FlexView style={styles.container}>
      <Text variant="medium-600">Ethers Actions</Text>
      <Button testID="sign-message-button" onPress={signMessage}>
        Sign
      </Button>
      <Button testID="send-transaction-button" onPress={sendTransaction}>
        Send Transaction
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
