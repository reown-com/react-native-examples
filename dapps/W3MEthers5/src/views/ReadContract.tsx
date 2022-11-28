import React, {useState} from 'react';
import {View} from 'react-native';
import {Button} from '@reown/appkit-ui-react-native';

import {RequestModal} from '../components/RequestModal';
import {
  useAppKitAccount,
  useAppKitProvider,
} from '@reown/appkit-ethers5-react-native';
import {ethers} from 'ethers';
import wagmigotchiABI from '../utils/wagmigotchiABI';

export function ReadContract() {
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
    setRequetsModalVisible(true);

    try {
      const ethersProvider = new ethers.providers.Web3Provider(walletProvider);
      const signer = ethersProvider.getSigner(address);
      const contractAddress = '0xecb504d39723b0be0e3a9aa33d646642d1051ee1';
      const contractABI = wagmigotchiABI;
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer,
      );
      const balance = await contract.getHunger();
      setData(balance.toString());
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
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
