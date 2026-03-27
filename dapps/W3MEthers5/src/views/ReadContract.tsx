import React, {useState} from 'react';
import {Button} from '@reown/appkit-ui-react-native';

import {useAccount, useProvider} from '@reown/appkit-react-native';
import {ethers} from 'ethers';
import wagmigotchiABI from '../utils/wagmigotchiABI';
import {ToastUtils} from '../utils/ToastUtils';

export function ReadContract() {
  const [isLoading, setIsLoading] = useState(false);
  const {provider} = useProvider();
  const {isConnected, address} = useAccount();

  const onSuccess = (data: any) => {
    ToastUtils.showSuccessToast('Read successful', data);
  };

  const onError = (error: Error) => {
    ToastUtils.showErrorToast('Read failed', error.message);
  };

  const onPress = async () => {
    if (!isConnected || !provider) {
      return;
    }

    setIsLoading(true);

    try {
      const ethersProvider = new ethers.providers.Web3Provider(provider);
      const signer = ethersProvider.getSigner(address);
      const contractAddress = '0xecb504d39723b0be0e3a9aa33d646642d1051ee1';
      const contractABI = wagmigotchiABI;
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer,
      );
      const balance = await contract.getHunger();
      onSuccess(balance.toString());
    } catch {
      onError(new Error('Error reading contract'));
    } finally {
      setIsLoading(false);
    }
  };

  return isConnected ? (
    <Button disabled={isLoading} onPress={onPress}>
      Read contract
    </Button>
  ) : null;
}
