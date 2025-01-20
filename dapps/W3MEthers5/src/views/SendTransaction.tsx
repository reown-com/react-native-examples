import React, {useState} from 'react';
import {View} from 'react-native';
import {Button} from '@reown/appkit-ui-react-native';
import {
  useAppKitAccount,
  useAppKitProvider,
} from '@reown/appkit-ethers5-react-native';
import {ethers} from 'ethers';

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
      const ethersProvider = new ethers.providers.Web3Provider(walletProvider);
      const signer = ethersProvider.getSigner(address);
      const tx = {
        to: testAddress,
        value: ethers.utils.parseEther('0.0001'),
        data: '0x',
      };
      const txResponse = await signer.sendTransaction(tx);
      setData(txResponse.hash);
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
      setRequetsModalVisible(true);
    }
  };

  return isConnected ? (
    <View>
      <Button disabled={requestModalVisible} onPress={onPress}>
        Send transaction
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
