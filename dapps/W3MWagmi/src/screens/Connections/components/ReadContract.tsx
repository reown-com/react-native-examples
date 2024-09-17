import React, {useState} from 'react';
import {View} from 'react-native';
import {Button} from '@reown/appkit-ui-react-native';
import {useAccount, useReadContract} from 'wagmi';
import {RequestModal} from '@/components/RequestModal';
import wagmigotchiABI from '@/utils/wagmigotchiABI';

export function ReadContract() {
  const [requestModalVisible, setRequetsModalVisible] = useState(false);
  const {isConnected, status} = useAccount();

  const {data, isError, isLoading, isSuccess} = useReadContract({
    address: '0xecb504d39723b0be0e3a9aa33d646642d1051ee1',
    abi: wagmigotchiABI,
    functionName: 'getHunger',
    query: {
      enabled: requestModalVisible,
    },
  });

  const onPress = () => {
    setRequetsModalVisible(true);
  };

  return isConnected ? (
    <View>
      <Button disabled={status === 'reconnecting'} onPress={onPress}>
        Read contract
      </Button>

      <RequestModal
        isVisible={requestModalVisible}
        isLoading={isLoading}
        rpcResponse={isSuccess ? data?.toString() : undefined}
        rpcError={isError ? 'Error reading contract' : undefined}
        onClose={() => setRequetsModalVisible(false)}
      />
    </View>
  ) : null;
}
