import React, {useState} from 'react';
import {View} from 'react-native';
import {Button} from '@web3modal/ui-react-native';

import {RequestModal} from '../components/RequestModal';
import usdtAbi from '../utils/usdtAbi';
import {
  useWeb3ModalAccount,
  useWeb3ModalProvider,
} from '@web3modal/ethers5-react-native';
import {ethers} from 'ethers';

export function WriteContract() {
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
      const ethersProvider = new ethers.providers.Web3Provider(walletProvider);
      const signer = ethersProvider.getSigner();
      const address = await signer.getAddress();
      const contractAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
      const contractABI = usdtAbi;
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer,
      );
      const response = await contract.approve(address, 100000);
      setData(response.toString());
    } catch {
      setError(true);
    }
    setIsLoading(false);
  };

  return isConnected ? (
    <View>
      <Button disabled={requestModalVisible} onPress={onPress}>
        Write contract
      </Button>

      <RequestModal
        isVisible={requestModalVisible}
        isLoading={isLoading}
        rpcResponse={data ? data : undefined}
        rpcError={error ? 'Error writing contract' : undefined}
        onClose={() => setRequetsModalVisible(false)}
      />
    </View>
  ) : null;
}
