import {eip155Wallets} from './EIP155Wallet';
import {getWalletAddressFromParams} from './HelperUtils';
import {chatClient, currentETHAddress, pushWalletClient} from './clients';

type TChatMethod = keyof typeof chatMethods;
type TPushMethod = keyof typeof pushMethods;
type TMessage = {
  id: number;
  jsonrpc: string;
  method: TChatMethod | TPushMethod;
  params?: any;
};

function replacer(key: string, value: any) {
  if (value instanceof Map) {
    return {
      dataType: 'Map',
      value: Array.from(value.entries()), // or with spread: value: [...value]
    };
  } else {
    return value;
  }
}

const chatMethods = {
  register: async (params: any) => {
    return chatClient.register({
      account: params.account,
      onSign: async onSignMessage => {
        const wallet =
          eip155Wallets[
            getWalletAddressFromParams([currentETHAddress], params.account)
          ];

        const signature = await wallet.signMessage(onSignMessage);
        return signature;
      },
    });
  },
  goPublic: async (params: any) =>
    chatClient.goPublic({
      account: params.account,
    }),
  goPrivate: async (params: any) =>
    chatClient.goPrivate({account: params.account}),
  getThreads: (params: any) => chatClient.getThreads({account: params.account}),
  getSentInvites: (params: any) =>
    chatClient.getSentInvites({
      account: params.account,
    }),
  getReceivedInvites: (params: any) =>
    chatClient.getReceivedInvites({account: params.account}),
  invite: async (params: any) =>
    chatClient.invite({
      inviteeAccount: params.inviteeAccount,
      inviteePublicKey: params.inviteePublicKey,
      inviterAccount: params.inviterAccount,
      message: params.message,
    }),
  ping: async (params: any) => chatClient.ping({topic: params.topic}),
  message: async (params: any) =>
    chatClient.message({
      message: params.message,
      authorAccount: params.authorAccount,
      timestamp: params.timestamp,
      topic: params.topic,
      media: params.media,
    }),
  resolve: async (params: any) => chatClient.resolve({account: params.account}),
  getMessages: (params: any) => chatClient.getMessages({topic: params.topic}),
  leave: async (params: any) => chatClient.leave({topic: params.topic}),
  accept: async (params: any) => chatClient.accept({id: params.id}),
  reject: async (params: any) => chatClient.reject({id: params.id}),
  unregister: async (params: any) =>
    chatClient.unregister({account: params.account}),
  // TODO: getMutedContacts is not supported yet
  getMutedContacts: () => {},
};

const pushMethods = {
  approve: async (params: any) =>
    pushWalletClient.approve({
      id: params.id,
      onSign: async onSignMessage => {
        const wallet =
          eip155Wallets[
            getWalletAddressFromParams([currentETHAddress], params.account)
          ];

        const signature = await wallet.signMessage(onSignMessage);
        return signature;
      },
    }),
  reject: async (params: any) =>
    pushWalletClient.reject({
      id: params.id,
      reason: params.reason,
    }),
  subscribe: async (params: any) =>
    pushWalletClient.subscribe({
      account: params.account,
      metadata: params.metadata,
      onSign: async onSignMessage => {
        const wallet =
          eip155Wallets[
            getWalletAddressFromParams([currentETHAddress], params.account)
          ];

        const signature = await wallet.signMessage(onSignMessage);
        return signature;
      },
    }),
  update: async (params: any) =>
    pushWalletClient.update({
      topic: params.topic,
      scope: params.scope,
    }),
  deleteSubscription: async (params: any) =>
    pushWalletClient.deleteSubscription({
      topic: params.topic,
    }),
  getActiveSubscriptions: () =>
    pushWalletClient.getActiveSubscriptions({
      account: `eip155:1:${currentETHAddress}`,
    }),
  getMessageHistory: (params: any) =>
    pushWalletClient.getMessageHistory({
      topic: params.topic,
    }),
  deletePushMessage: (params: any) =>
    pushWalletClient.deletePushMessage({id: params.id}),
};

export const generateResponse = async (
  target: 'chat' | 'push' | 'auth',
  {id, jsonrpc, method, params}: TMessage,
) => {
  if (target === 'chat') {
    const chatMethod = chatMethods[method as TChatMethod];
    if (!chatMethod) {
      throw new Error(`Unsupported chat method ${method}`);
    }
    try {
      const response = await chatMethod({...params, id});
      const payload = JSON.stringify({
        id,
        result: response ? JSON.stringify(response, replacer) : null,
        jsonrpc,
      });
      return `window.web3inbox.chat.postMessage(${payload})`;
    } catch (error) {
      console.log(`Failed to call ${method} on ${target}`);
      console.error(error);
      throw error;
    }
  }
  if (target === 'push') {
    const pushMethod = pushMethods[method as TPushMethod];
    if (!pushMethod) {
      throw new Error(`Unsupported push method ${method}`);
    }
    try {
      const response = await pushMethod({...params, id});
      const payload = JSON.stringify({
        id,
        result: response ? JSON.stringify(response, replacer) : null,
        jsonrpc,
      });
      return `window.web3inbox.push.postMessage(${payload})`;
    } catch (error) {
      console.log(`Failed to call ${method} on ${target}`);
      console.error(error);
      throw error;
    }
  }
};
