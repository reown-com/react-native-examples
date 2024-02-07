import React, {useState} from 'react';
import {View} from 'react-native';
import {Button} from '@web3modal/ui-react-native';

import {RequestModal} from '../components/RequestModal';
import {BrowserProvider} from 'ethers';
import {
  useWeb3ModalAccount,
  useWeb3ModalProvider,
} from '@web3modal/ethers-react-native';
import {eip712} from '../utils/eip712';

export function SignTypedData() {
  const [requestModalVisible, setRequetsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<string | undefined>();
  const [error, setError] = useState(false);
  const {walletProvider} = useWeb3ModalProvider();
  const {isConnected} = useWeb3ModalAccount();

  const onPress = async () => {
    if (!isConnected || !walletProvider) {
      return;
    }

    setData(undefined);
    setError(false);
    setIsLoading(true);
    setRequetsModalVisible(true);

    try {
      const ethersProvider = new BrowserProvider(walletProvider);

      const signer = await ethersProvider.getSigner();
      const message = JSON.stringify(eip712.example);

      const signature = await walletProvider.request({
        method: 'eth_signTypedData',
        params: [signer.address, message],
      });

      setData(signature?.toString());
    } catch (e) {
      console.log(e);
      setError(true);
    }
    setIsLoading(false);
  };

  return isConnected ? (
    <View>
      <Button disabled={requestModalVisible} onPress={onPress}>
        Sign typed data
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
