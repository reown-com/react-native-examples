import React, {useState} from 'react';

import {Button} from '@reown/appkit-ui-react-native';
import {BrowserProvider, JsonRpcSigner, parseEther} from 'ethers';
import {useAccount, useProvider} from '@reown/appkit-react-native';

import {testAddress} from '../utils/misc';
import {ToastUtils} from '../utils/ToastUtils';

export function SendTransaction() {
  const [isLoading, setIsLoading] = useState(false);

  const {provider} = useProvider();
  const {isConnected, address} = useAccount();

  const onSuccess = (data: any) => {
    ToastUtils.showSuccessToast('Send successful', data);
  };

  const onError = (error: Error) => {
    ToastUtils.showErrorToast('Send failed', error.message);
  };

  const onPress = async () => {
    if (!isConnected || !provider) {
      return;
    }

    setIsLoading(true);

    try {
      const ethersProvider = new BrowserProvider(provider);
      const signer = new JsonRpcSigner(ethersProvider, address!);
      const tx = {
        to: testAddress,
        value: parseEther('0.0001'),
        data: '0x',
      };
      const txResponse = await signer.sendTransaction(tx);
      onSuccess(txResponse.hash);
    } catch (e) {
      onError(new Error('Error sending transaction'));
    } finally {
      setIsLoading(false);
    }
  };

  return isConnected ? (
    <Button disabled={isLoading} onPress={onPress}>
      {isLoading ? 'Loading...' : 'Send transaction'}
    </Button>
  ) : null;
}
