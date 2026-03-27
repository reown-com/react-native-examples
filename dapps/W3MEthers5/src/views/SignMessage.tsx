import React, {useState} from 'react';
import {Button} from '@reown/appkit-ui-react-native';
import {ethers} from 'ethers';
import {useAccount, useProvider} from '@reown/appkit-react-native';
import {ToastUtils} from '../utils/ToastUtils';

export function SignMessage() {
  const [isLoading, setIsLoading] = useState(false);
  const {provider} = useProvider();
  const {isConnected, address} = useAccount();

  const onSuccess = (data: any) => {
    ToastUtils.showSuccessToast('Sign successful', data);
  };

  const onError = (error: Error) => {
    ToastUtils.showErrorToast('Sign failed', error.message);
  };

  const onPress = async () => {
    if (!isConnected || !provider) {
      return;
    }

    setIsLoading(true);

    try {
      const ethersProvider = new ethers.providers.Web3Provider(provider);

      const signer = ethersProvider.getSigner(address);
      const message = 'hello appkit + ethers5';
      const signature = await signer.signMessage(message);
      onSuccess(signature.toString());
    } catch (e) {
      console.log(e);
      onError(new Error('Error signing message'));
    } finally {
      setIsLoading(false);
    }
  };

  return isConnected ? (
    <Button disabled={isLoading} onPress={onPress}>
      Sign message
    </Button>
  ) : null;
}
