import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {Button} from '@reown/appkit-ui-react-native';

import {useAccount, useSignMessage} from 'wagmi';
import {RequestModal} from '@/components/RequestModal';

export function SignMessage() {
  const [requestModalVisible, setRequetsModalVisible] = useState(false);
  const {isConnected, status} = useAccount();

  const {data, isError, isPending, isSuccess, signMessage} = useSignMessage();

  const onPress = () => {
    signMessage({
      message: 'hello appkit rn + wagmi',
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
        {isPending ? 'Loading...' : 'Sign message'}
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
