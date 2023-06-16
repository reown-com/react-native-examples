import {eip155Wallets} from './EIP155Wallet';
import {getWalletAddressFromParams} from './HelperUtils';
import {chatClient, currentETHAddress} from './clients';

type TMessage = {
  id: number;
  jsonrpc: string;
  method: keyof typeof chatMethods;
  params?: any;
};

const chatMethods = {
  register: async (message: any) =>
    chatClient.register({
      account: message.params.account,
      onSign: async onSignMessage => {
        const wallet =
          eip155Wallets[
            getWalletAddressFromParams(
              [currentETHAddress],
              message.params.account,
            )
          ];

        const signature = await wallet.signMessage(onSignMessage);
        return signature;
      },
    }),
};

export const generateResponse = async (
  target: 'chat' | 'push',
  {id, jsonrpc, method, params}: TMessage,
) => {
  if (target === 'chat') {
    if (!chatMethods[method]) {
      throw new Error(`Unsupported method ${method}`);
    }
    const response = await chatMethods[method](params);
    return `window.web3inbox.chat.postMessage(${JSON.stringify({
      id,
      result: response,
      jsonrpc,
    })})`;
  }
};
