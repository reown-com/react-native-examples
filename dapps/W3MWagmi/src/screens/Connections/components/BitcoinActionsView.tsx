import React from 'react';
import { StyleSheet } from 'react-native';
import { Button, Text, FlexView } from '@reown/appkit-ui-react-native';
import { useAccount, useProvider } from '@reown/appkit-react-native';

import { ToastUtils } from '@/utils/ToastUtils';
import { BitcoinUtil, SignPSBTResponse } from '@/utils/BitcoinUtil';

export function BitcoinActionsView() {
  const isConnected = true;
  const { address, chainId } = useAccount();
  const provider = useProvider('bip122');

  const onSignSuccess = (data: string) => {
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

      const message = 'Hello from AppKit Bitcoin';

      const { signature } = (await provider.request(
        {
          method: 'signMessage',
          params: { message, account: address, address, protocol: 'ecdsa' },
        },
        chainId
      )) as { address: string; signature: string };

      const formattedSignature = Buffer.from(signature, 'hex').toString('base64');

      onSignSuccess(formattedSignature);
    } catch (error) {
      onSignError(error as Error);
    }
  };

  const signPsbt = async () => {
    try {
      if (!provider) {
        ToastUtils.showErrorToast('Sign failed', 'No provider found');

        return;
      }

      if (!address) {
        ToastUtils.showErrorToast('Sign failed', 'No address found');

        return;
      }

      if (chainId?.split(':')[0] !== 'bip122') {
        ToastUtils.showErrorToast('Sign failed', 'The selected chain is not bip122');

        return;
      }

      const utxos = await BitcoinUtil.getUTXOs(address, chainId as `bip122:${string}`);
      const feeRate = await BitcoinUtil.getFeeRate();

      const params = BitcoinUtil.createSignPSBTParams({
        amount: 1500,
        feeRate,
        caipNetworkId: chainId as `bip122:${string}`,
        recipientAddress: address,
        senderAddress: address,
        utxos,
      });

      params.broadcast = false;

      const response = (await provider.request(
        {
          method: 'signPsbt',
          params: {
            account: address,
            psbt: params.psbt,
            signInputs: params.signInputs,
            broadcast: params.broadcast,
          },
        },
        chainId
      )) as SignPSBTResponse;

      onSignSuccess(`${response.psbt}-${response.txid}`);
    } catch (error) {

      console.log('error', error);
      onSignError(error as Error);
    }
  };

  return isConnected ? (
    <FlexView style={styles.container}>
      <Text variant="medium-600">Bitcoin Actions</Text>
      <Button testID="sign-message-button" onPress={signMessage}>
        Sign
      </Button>
      <Button testID="sign-psbt-button" onPress={signPsbt}>
        Sign PSBT
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
