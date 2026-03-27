import React, {useState} from 'react';
import {Button} from '@reown/appkit-ui-react-native';
import {BrowserProvider, JsonRpcSigner} from 'ethers';

import {useAccount, useProvider} from '@reown/appkit-react-native';
import {eip712} from '../utils/eip712';
import {ToastUtils} from '../utils/ToastUtils';

export function SignTypedDataV4() {
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
      const message = JSON.stringify(eip712.example);

      const signature = await provider.request({
        method: 'eth_signTypedData_v4',
        params: [signer.address, message],
      });

      onSuccess(signature?.toString());
    } catch (e) {
      console.log(e);
      onError(new Error('Error signing typed data'));
    } finally {
      setIsLoading(false);
    }
  };

  return isConnected ? (
    <Button disabled={isLoading} onPress={onPress}>
      {isLoading ? 'Loading...' : 'Sign typed data'}
    </Button>
  ) : null;
}
