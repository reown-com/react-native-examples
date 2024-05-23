import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {Button} from '@web3modal/ui-react-native';

import {useAccount, useSendTransaction} from 'wagmi';
import {RequestModal} from '@/components/RequestModal';
import {parseEther} from 'viem/utils';

export function SendTransaction() {
  const [requestModalVisible, setRequetsModalVisible] = useState(false);
  const {isConnected} = useAccount();

  const {data, isPending, isSuccess, isError, sendTransaction} =
    useSendTransaction();

  const onPress = () => {
    sendTransaction({
      to: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // vitalik.eth
      value: parseEther('0.001'),
      data: '0x', // to make it work with some wallets
    });
  };

  useEffect(() => {
    if (isSuccess || isError) {
      setRequetsModalVisible(true);
    }
  }, [isSuccess, isError]);

  return isConnected ? (
    <View>
      <Button disabled={isPending} onPress={onPress}>
        {isPending ? 'Loading...' : 'Send transaction'}
      </Button>

      <RequestModal
        isVisible={requestModalVisible}
        isLoading={isPending}
        rpcResponse={isSuccess ? data : undefined}
        rpcError={isError ? 'Error sending transaction' : undefined}
        onClose={() => setRequetsModalVisible(false)}
      />
    </View>
  ) : null;
}
