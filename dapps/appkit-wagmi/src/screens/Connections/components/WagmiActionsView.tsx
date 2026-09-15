import React from 'react';
import { Button, Text, FlexView } from '@reown/appkit-ui-react-native';
import { StyleSheet } from 'react-native';
import { useSignMessage, useAccount, useSendTransaction, useEstimateGas, useSignTypedData } from 'wagmi';
import { Hex, parseEther } from 'viem';
import { SendTransactionData, SignMessageData, SignTypedDataData } from 'wagmi/query';
import { ToastUtils } from '@/utils/ToastUtils';
import { eip712 } from '@/utils/eip712';

export function WagmiActionsView() {
  const { isConnected } = useAccount();

  const onSignSuccess = (data: SignMessageData) => {
    ToastUtils.showSuccessToast('Signature successful', data);
  };

  const onSignError = (error: Error) => {
    ToastUtils.showErrorToast('Signature failed', error.message);
  };

  const onSendSuccess = (data: SendTransactionData) => {
    ToastUtils.showSuccessToast('Transaction successful', data);
  };

  const onSendError = (error: Error) => {
    ToastUtils.showErrorToast('Transaction failed', error.message);
  };

  const { isPending, signMessage } = useSignMessage({
    mutation: {
      onSuccess: onSignSuccess,
      onError: onSignError,
    },
  });

  const TX = {
    to: '0x704457b418E9Fb723e1Bc0cB98106a6B8Cf87689' as Hex, // Test wallet
    value: parseEther('0.001'),
    data: '0x' as Hex,
  };

  const { data: gas, isError: isGasError } = useEstimateGas(TX);

  const {
    isPending: isSending,

    sendTransaction,
  } = useSendTransaction({
    mutation: {
      onSuccess: onSendSuccess,
      onError: onSendError,
    },
  });

  const onSignTypedDataSuccess = (data: SignTypedDataData) => {
    ToastUtils.showSuccessToast('Signature successful', data);
  };

  const onSignTypedDataError = (error: Error) => {
    ToastUtils.showErrorToast('Signature failed', error.message);
  };
  const { isPending: isTypedDataPending, signTypedData } = useSignTypedData({
    mutation: {
      onSuccess: onSignTypedDataSuccess,
      onError: onSignTypedDataError,
    },
  });

  return isConnected ? (
    <FlexView style={styles.container}>
      <Text variant="medium-600">Wagmi Actions</Text>
      <Button
        disabled={isPending}
        loading={isPending}
        testID="sign-message-button"
        onPress={() => signMessage({ message: 'Hello AppKit!' })}
      >
        Sign
      </Button>
      {isGasError && <Text>Error estimating gas</Text>}
      <Button disabled={isSending} loading={isSending} onPress={() => sendTransaction({ ...TX, gas })}>
        Send
      </Button>
      {isSending && <Text>Check Wallet</Text>}
      <Button disabled={isTypedDataPending} loading={isTypedDataPending} onPress={() => signTypedData({
        domain: eip712.domain,
        message: eip712.message,
        primaryType: 'Mail',
        types: eip712.types,
      })}>
        Sign Typed Data
      </Button>
    </FlexView>
  ) : null;
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    gap: 8,
  },
});
