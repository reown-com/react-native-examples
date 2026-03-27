import React, {useState} from 'react';
import {Button} from '@reown/appkit-ui-react-native';

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
      // const ethersProvider = new ethers.providers.Web3Provider(walletProvider);
      // const signer = ethersProvider.getSigner(address);
      const message = JSON.stringify(eip712.example);

      // eth_signTypedData_v4 params
      const params = [address, message];

      // send message
      const signature = await provider.request({
        method: 'eth_signTypedData_v4',
        params: params,
      });

      onSuccess(signature?.toString());
    } catch (e) {
      onError(new Error('Error signing typed data'));
    } finally {
      setIsLoading(false);
    }
  };

  return isConnected ? (
    <Button disabled={isLoading} onPress={onPress}>
      Sign typed data (v4)
    </Button>
  ) : null;
}
