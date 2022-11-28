import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {Button} from '@reown/appkit-ui-react-native';

import {useAccount, useSignTypedData} from 'wagmi';
import {RequestModal} from '@/components/RequestModal';
import {eip712} from '@/utils/eip712';

export function SignTypedDataV4() {
  const [requestModalVisible, setRequetsModalVisible] = useState(false);
  const {isConnected, status} = useAccount();

  const {data, isError, isPending, isSuccess, signTypedData} =
    useSignTypedData();

  const onPress = () => {
    signTypedData({
      domain: eip712.domain,
      message: eip712.message,
      primaryType: 'Mail',
      types: eip712.types,
    });
  };

  useEffect(() => {
    if (isSuccess || isError) {
      setRequetsModalVisible(true);
    }
  }, [isSuccess, isError]);

  return isConnected ? (
    <View>
      <Button
        disabled={isPending || status === 'reconnecting'}
        onPress={onPress}>
        {isPending ? 'Loading...' : 'eth_signTypedData_v4'}
      </Button>

      <RequestModal
        isVisible={requestModalVisible}
        isLoading={isPending}
        rpcResponse={isSuccess ? data : undefined}
        rpcError={isError ? 'Error signing message' : undefined}
        onClose={() => setRequetsModalVisible(false)}
      />
    </View>
  ) : null;
}
