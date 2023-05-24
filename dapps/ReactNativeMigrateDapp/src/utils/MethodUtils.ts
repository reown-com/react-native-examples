import WalletConnect from '@walletconnect/client';

export const signMessage = async (connector: WalletConnect) => {
  if (!connector || !connector.connected) {
    throw new Error('Not connected');
  }

  // Draft Message Parameters
  const message = 'My email is john@doe.com';
  const msgParams = [message, connector.accounts[0]];

  const result = await connector.signPersonalMessage(msgParams);
  return result;
};
