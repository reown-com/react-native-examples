import React, {useState} from 'react';

import {Button} from '@reown/appkit-ui-react-native';
import {BrowserProvider, JsonRpcSigner} from 'ethers';
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
      const ethersProvider = new BrowserProvider(provider);
      const signer = new JsonRpcSigner(ethersProvider, address!);
      const signature = await signer.signMessage('hello appkit + ethers');
      onSuccess(signature.toString());
    } catch (e) {
      onError(new Error('Error signing message'));
    } finally {
      setIsLoading(false);
    }
  };

  return isConnected ? (
    <Button disabled={isLoading} onPress={onPress}>
      {isLoading ? 'Loading...' : 'Sign message'}
    </Button>
  ) : null;
}
