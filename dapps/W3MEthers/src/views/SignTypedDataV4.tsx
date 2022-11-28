import React, {useState} from 'react';
import {View} from 'react-native';
import {Button} from '@reown/appkit-ui-react-native';

import {RequestModal} from '../components/RequestModal';
import {BrowserProvider, JsonRpcSigner} from 'ethers';
import {
  useAppKitAccount,
  useAppKitProvider,
} from '@reown/appkit-ethers-react-native';
import {eip712} from '../utils/eip712';

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
      const ethersProvider = new BrowserProvider(walletProvider);
      const signer = new JsonRpcSigner(ethersProvider, address!);
      const message = JSON.stringify(eip712.example);

      const signature = await walletProvider.request({
        method: 'eth_signTypedData_v4',
        params: [signer.address, message],
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
      <Button disabled={requestModalVisible || isLoading} onPress={onPress}>
        {isLoading ? 'Loading...' : 'Sign typed data'}
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
