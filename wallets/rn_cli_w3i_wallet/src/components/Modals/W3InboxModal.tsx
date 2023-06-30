import React, {ReactNode, useCallback, useEffect, useMemo, useRef} from 'react';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';
import Modal from 'react-native-modal';
import {WebView, WebViewMessageEvent} from 'react-native-webview';
import {
  chatClient,
  currentETHAddress,
  pushWalletClient,
} from '../../utils/clients';
import {generateResponse} from '../../utils/Web3Inbox';

interface W3InboxModalProps {
  visible: boolean;
  setVisible: (arg0: boolean) => void;
  chatEnabled?: boolean;
  pushEnabled?: boolean;
  settingsEnabled?: boolean;
  closeButton?: ReactNode;
}

export function W3InboxModal({
  visible,
  setVisible,
  chatEnabled = true,
  pushEnabled = true,
  settingsEnabled = true,
}: W3InboxModalProps) {
  const webViewRef = useRef<WebView>(null);

  const RN = 'reactnative';
  const WEB3INBOX_BASE_URL =
    'https://web3inbox-dev-hidden-git-chore-rn-message-walletconnect1.vercel.app/';
  const WEB3INBOX_PROVIDER_QUERY_PARAMS = `?chatProvider=${RN}&authProvider=${RN}&pushProvider=${RN}&account=${currentETHAddress}`;

  const WEB3INBOX_VISIBILITY_QUERY_PARAMS = useMemo(
    () =>
      `&chatEnabled=${chatEnabled}&pushEnabled=${pushEnabled}&settingsEnabled=${settingsEnabled}`,
    [chatEnabled, pushEnabled, settingsEnabled],
  );

  const WEB3INBOX_URL = `${WEB3INBOX_BASE_URL}${WEB3INBOX_PROVIDER_QUERY_PARAMS}${WEB3INBOX_VISIBILITY_QUERY_PARAMS}`;

  const handleMessage = useCallback(async (event: WebViewMessageEvent) => {
    if (!event.nativeEvent.data) {
      return;
    }
    const message = JSON.parse(event.nativeEvent.data);
    const injectedJavascript = await generateResponse(
      message.targetClient,
      message,
    );
    if (!injectedJavascript) {
      return;
    }
    webViewRef.current?.injectJavaScript(injectedJavascript);
  }, []);

  useEffect(() => {
    chatClient.on('chat_message', event => {
      webViewRef.current?.injectJavaScript(
        `window.web3inbox.chat.postMessage(${JSON.stringify({
          id: Date.now(),
          method: 'chat_message',
          params: event,
          jsonrpc: '2.0',
        })})`,
      );
    });
    chatClient.on('chat_ping', event => {
      webViewRef.current?.injectJavaScript(
        `window.web3inbox.chat.postMessage(${JSON.stringify({
          id: Date.now(),
          method: 'chat_ping',
          params: event,
          jsonrpc: '2.0',
        })})`,
      );
    });
    chatClient.on('chat_invite', event => {
      webViewRef.current?.injectJavaScript(
        `window.web3inbox.chat.postMessage(${JSON.stringify({
          id: Date.now(),
          method: 'chat_invite',
          params: event,
          jsonrpc: '2.0',
        })})`,
      );
    });
    chatClient.on('chat_invite_accepted', event => {
      webViewRef.current?.injectJavaScript(
        `window.web3inbox.chat.postMessage(${JSON.stringify({
          id: Date.now(),
          method: 'chat_invite_accepted',
          params: event,
          jsonrpc: '2.0',
        })})`,
      );
    });
    chatClient.on('chat_invite_rejected', event => {
      webViewRef.current?.injectJavaScript(
        `window.web3inbox.chat.postMessage(${JSON.stringify({
          id: Date.now(),
          method: 'chat_invite_rejected',
          params: event,
          jsonrpc: '2.0',
        })})`,
      );
    });
    chatClient.on('chat_left', event => {
      webViewRef.current?.injectJavaScript(
        `window.web3inbox.chat.postMessage(${JSON.stringify({
          id: Date.now(),
          method: 'chat_left',
          params: event,
          jsonrpc: '2.0',
        })})`,
      );
    });

    // Push client events
    pushWalletClient.on('push_subscription', event => {
      webViewRef.current?.injectJavaScript(
        `window.web3inbox.push.postMessage(${JSON.stringify({
          id: Date.now(),
          method: 'push_subscription',
          params: event,
          jsonrpc: '2.0',
        })})`,
      );
    });
    pushWalletClient.on('push_message', event => {
      webViewRef.current?.injectJavaScript(
        `window.web3inbox.push.postMessage(${JSON.stringify({
          id: Date.now(),
          method: 'push_message',
          params: event,
          jsonrpc: '2.0',
        })})`,
      );
    });
    pushWalletClient.on('push_proposal', event => {
      webViewRef.current?.injectJavaScript(
        `window.web3inbox.push.postMessage(${JSON.stringify({
          id: Date.now(),
          method: 'push_proposal',
          params: event,
          jsonrpc: '2.0',
        })})`,
      );
    });
    pushWalletClient.on('push_response', event => {
      webViewRef.current?.injectJavaScript(
        `window.web3inbox.push.postMessage(${JSON.stringify({
          id: Date.now(),
          method: 'push_response',
          params: event,
          jsonrpc: '2.0',
        })})`,
      );
    });
    pushWalletClient.on('push_update', event => {
      webViewRef.current?.injectJavaScript(
        `window.web3inbox.push.postMessage(${JSON.stringify({
          id: Date.now(),
          method: 'push_update',
          params: event,
          jsonrpc: '2.0',
        })})`,
      );
    });
    pushWalletClient.on('push_delete', event => {
      webViewRef.current?.injectJavaScript(
        `window.web3inbox.push.postMessage(${JSON.stringify({
          id: Date.now(),
          method: 'push_delete',
          params: event,
          jsonrpc: '2.0',
        })})`,
      );
    });
  }, []);

  return (
    <Modal backdropOpacity={0.6} isVisible={visible}>
      <TouchableOpacity onPress={() => setVisible(false)}>
        <Text style={styles.closeText}>CLOSE</Text>
      </TouchableOpacity>
      <WebView
        ref={webViewRef}
        source={{uri: WEB3INBOX_URL}}
        style={styles.webview}
        originWhitelist={['*']}
        onMessage={handleMessage}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  webview: {
    display: 'flex',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    paddingTop: 30,
    backgroundColor: 'white',
    width: '100%',
    height: '100%',
    position: 'absolute',
    bottom: 5,
  },
  closeText: {
    color: 'red',
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 10,
    fontWeight: 'bold',
    alignSelf: 'flex-end',
    backgroundColor: 'white',
    padding: 4,
  },
});
