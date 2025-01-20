import React, {useState} from 'react';
import {View} from 'react-native';
import {Button} from '@reown/appkit-ui-react-native';

import {RequestModal} from '../components/RequestModal';

import {
  useAppKitAccount,
  useAppKitProvider,
} from '@reown/appkit-ethers5-react-native';
import {eip712} from '../utils/eip712';
// import {ethers} from 'ethers';

export function SignTypedDataV4() {
  const [requestModalVisible, setRequetsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<string | undefined>();
  const [error, setError] = useState(false);
  const {walletProvider} = useAppKitProvider();
  const {isConnected, address} = useAppKitAccount();

  const onPress = async () => {
    if (!isConnected || !walletProvider) {
      return;
    }

    setData(undefined);
    setError(false);
    setIsLoading(true);

    try {
      // const ethersProvider = new ethers.providers.Web3Provider(walletProvider);
      // const signer = ethersProvider.getSigner(address);
      const message = JSON.stringify(eip712.example);

      // eth_signTypedData_v4 params
      const params = [address, message];

      // send message
      const signature = await walletProvider.request({
        method: 'eth_signTypedData_v4',
        params: params,
      });

      setData(signature?.toString());
    } catch (e) {
      console.log(e);
      setError(true);
    } finally {
      setIsLoading(false);
      setRequetsModalVisible(true);
    }
  };

  return isConnected ? (
    <View>
      <Button disabled={requestModalVisible} onPress={onPress}>
        Sign typed data (v4)
      </Button>

      <RequestModal
        isVisible={requestModalVisible}
        isLoading={isLoading}
        rpcResponse={data ? data : undefined}
        rpcError={error ? 'Error signing typed data' : undefined}
        onClose={() => setRequetsModalVisible(false)}
      />
    </View>
  ) : null;
}
