import React from 'react';
import {useAccount} from '@reown/appkit-react-native';
import {SignMessage} from './SignMessage';
import {SendTransaction} from './SendTransaction';
import {SignTypedDataV4} from './SignTypedDataV4';
import {ReadContract} from './ReadContract';
import {WriteContract} from './WriteContract';

export function ActionsView() {
  const {chainId} = useAccount();
  const isEip = chainId?.startsWith('eip155');

  return isEip ? (
    <>
      <SignMessage />
      <SendTransaction />
      <SignTypedDataV4 />
      <ReadContract />
      <WriteContract />
    </>
  ) : null;
}
