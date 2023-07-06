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
  const WEB3INBOX_BASE_URL = 'https://web3inbox-dev-hidden.vercel.app/';
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

  const onEvent = useCallback(
    (eventName: string, event: Record<string, any>) =>
      webViewRef.current?.injectJavaScript(
        `window.web3inbox.chat.postMessage(${JSON.stringify({
          id: Date.now(),
          method: eventName,
          params: event,
          jsonrpc: '2.0',
        })})`,
      ),
    [],
  );

  useEffect(() => {
    chatClient.on('chat_message', event => {
      onEvent('chat_message', event);
    });
    chatClient.on('chat_ping', event => {
      onEvent('chat_ping', event);
    });
    chatClient.on('chat_invite', event => {
      onEvent('chat_invite', event);
    });
    chatClient.on('chat_invite_accepted', event => {
      onEvent('chat_invite_accepted', event);
    });
    chatClient.on('chat_invite_rejected', event => {
      onEvent('chat_invite_rejected', event);
    });
    chatClient.on('chat_left', event => {
      onEvent('chat_left', event);
    });

    // Push client events
    pushWalletClient.on('push_subscription', event => {
      onEvent('push_subscription', event);
    });
    pushWalletClient.on('push_message', event => {
      onEvent('push_message', event);
    });
    pushWalletClient.on('push_proposal', event => {
      onEvent('push_proposal', event);
    });
    pushWalletClient.on('push_response', event => {
      onEvent('push_response', event);
    });
    pushWalletClient.on('push_update', event => {
      onEvent('push_update', event);
    });
    pushWalletClient.on('push_delete', event => {
      onEvent('push_delete', event);
    });
  }, [onEvent]);

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
