import {ChatClient} from '@walletconnect/chat-client';
export let chatClient: any;

// @ts-expect-error - env is a virtualised module via Babel config.
import {ENV_PROJECT_ID, ENV_KEYSERVER_URL} from '@env';

export async function createChatClient() {
  chatClient = await ChatClient.init({
    projectId: ENV_PROJECT_ID,
    keyserverUrl: ENV_KEYSERVER_URL,
  });
}
