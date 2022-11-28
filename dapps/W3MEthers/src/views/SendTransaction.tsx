import React, {useState} from 'react';
import {View} from 'react-native';
import {Button} from '@reown/appkit-ui-react-native';
import {BrowserProvider, JsonRpcSigner, parseEther} from 'ethers';
import {
  useAppKitAccount,
  useAppKitProvider,
} from '@reown/appkit-ethers-react-native';

import {RequestModal} from '../components/RequestModal';
import {testAddress} from '../utils/misc';

export function SendTransaction() {
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
      const tx = {
        to: testAddress,
        value: parseEther('0.0001'),
        data: '0x',
      };
      const txResponse = await signer.sendTransaction(tx);
      setData(txResponse.hash);
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
        {isLoading ? 'Loading...' : 'Send transaction'}
      </Button>

      <RequestModal
        isVisible={requestModalVisible}
        isLoading={isLoading}
        rpcResponse={data ? data : undefined}
        rpcError={error ? 'Error sending transaction' : undefined}
        onClose={() => setRequetsModalVisible(false)}
      />
    </View>
  ) : null;
}
