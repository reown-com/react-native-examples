import React, {useState} from 'react';
import {Button} from '@reown/appkit-ui-react-native';
import usdtAbi from '../utils/usdtAbi';
import {useAccount, useProvider} from '@reown/appkit-react-native';
import {ethers} from 'ethers';
import {ToastUtils} from '../utils/ToastUtils';

export function WriteContract() {
  const [isLoading, setIsLoading] = useState(false);
  const {provider} = useProvider();
  const {isConnected, address} = useAccount();

  const onSuccess = (data: any) => {
    ToastUtils.showSuccessToast('Write successful', data);
  };

  const onError = (error: Error) => {
    ToastUtils.showErrorToast('Write failed', error.message);
  };

  const onPress = async () => {
    if (!isConnected || !provider) {
      return;
    }

    setIsLoading(true);

    try {
      const ethersProvider = new ethers.providers.Web3Provider(provider);
      const signer = ethersProvider.getSigner(address);
      const contractAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
      const contractABI = usdtAbi;
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer,
      );
      const response = await contract.approve(address, 100000);
      onSuccess(response.toString());
    } catch (e) {
      console.log(e);
      onError(new Error('Error writing contract'));
    } finally {
      setIsLoading(false);
    }
  };

  return isConnected ? (
    <Button disabled={isLoading} onPress={onPress}>
      Write contract
    </Button>
  ) : null;
}
