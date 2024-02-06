import React, {useState} from 'react';
import {View} from 'react-native';
import {Button} from '@web3modal/ui-react-native';

import {RequestModal} from '../components/RequestModal';
import {
  useWeb3ModalAccount,
  useWeb3ModalProvider,
} from '@web3modal/ethers5-react-native';
import {BrowserProvider, Contract} from 'ethers';
import wagmigotchiABI from '../utils/wagmigotchiABI';

export function ReadContract() {
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
      const contractAddress = '0xecb504d39723b0be0e3a9aa33d646642d1051ee1';
      const contractABI = wagmigotchiABI;
      const contract = new Contract(contractAddress, contractABI, signer);
      const balance = await contract.getHunger();
      setData(balance.toString());
    } catch {
      setError(true);
    }
    setIsLoading(false);
  };

  return isConnected ? (
    <View>
      <Button disabled={isLoading} onPress={onPress}>
        Read contract
      </Button>

      <RequestModal
        isVisible={requestModalVisible}
        isLoading={isLoading}
        rpcResponse={data ? data : undefined}
        rpcError={error ? 'Error reading contract' : undefined}
        onClose={() => setRequetsModalVisible(false)}
      />
    </View>
  ) : null;
}
