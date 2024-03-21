import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {Button} from '@web3modal/ui-react-native';

import {useAccount, useSignTypedData} from 'wagmi';
import {RequestModal} from '../components/RequestModal';
import {eip712} from '../utils/eip712';

export function SignTypedDataV4() {
  const [requestModalVisible, setRequetsModalVisible] = useState(false);
  const {isConnected} = useAccount();

  const {data, isError, isLoading, isSuccess, signTypedData} = useSignTypedData(
    {
      domain: eip712.domain,
      message: eip712.message,
      primaryType: 'Mail',
      types: eip712.types,
    },
  );

  const onPress = () => {
    signTypedData();
  };

  useEffect(() => {
    if (isSuccess || isError) {
      setRequetsModalVisible(true);
    }
  }, [isSuccess, isError]);

  return isConnected ? (
    <View>
      <Button disabled={isLoading} onPress={onPress}>
        {isLoading ? 'Loading...' : 'eth_signTypedData_v4'}
      </Button>

      <RequestModal
        isVisible={requestModalVisible}
        isLoading={isLoading}
        rpcResponse={isSuccess ? data : undefined}
        rpcError={isError ? 'Error signing message' : undefined}
        onClose={() => setRequetsModalVisible(false)}
      />
    </View>
  ) : null;
}
