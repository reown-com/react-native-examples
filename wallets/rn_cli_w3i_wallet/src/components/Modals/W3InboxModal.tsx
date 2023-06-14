import React, {useCallback, useRef} from 'react';
import {TouchableOpacity, Text} from 'react-native';
import Modal from 'react-native-modal';
// import {SafeAreaView} from 'react-native-safe-area-context';
import {WebView, WebViewMessageEvent} from 'react-native-webview';
import {chatClient, currentETHAddress} from '../../utils/clients';
import {getWalletAddressFromParams} from '../../utils/HelperUtils';
import {eip155Wallets} from '../../utils/EIP155Wallet';

interface W3InboxModalProps {
  visible: boolean;
  setVisible: (arg0: boolean) => void;
}

export function W3InboxModal({visible, setVisible}: W3InboxModalProps) {
  const webViewRef = useRef<WebView>(null);
  const RN = 'reactnative';
  const WEB3INBOX_BASE_URL = 'https://web3inbox-dev-hidden.vercel.app/';
  const WEB3INBOX_QUERY_PARAMS = `?chatProvider=${RN}&authProvider=${RN}&pushProvider=${RN}&account=${currentETHAddress}`;
  const WEB3INBOX_URL = `${WEB3INBOX_BASE_URL}${WEB3INBOX_QUERY_PARAMS}`;
  const handleMessage = useCallback(async (event: WebViewMessageEvent) => {
    console.log(event);
    if (!event.nativeEvent.data) {
      return;
    }
    const message = JSON.parse(event.nativeEvent.data);
    const registerResponse = await chatClient.register({
      account: message.params.account,
      onSign: async onSignMessage => {
        console.log({onSignMessage, currentETHAddress});
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
    });

    console.log({registerResponse});
    webViewRef.current?.injectJavaScript(
      `window.web3inbox.chat.postMessage(${JSON.stringify({
        id: message.id,
        jsonrpc: '2.0',
        result: registerResponse,
      })})`,
    );
    //
  }, []);
  console.log({WEB3INBOX_URL});
  return (
    <Modal backdropOpacity={0.6} isVisible={visible}>
      <TouchableOpacity onPress={() => setVisible(false)}>
        <Text style={{color: 'red', marginTop: 20, fontWeight: 'bold'}}>
          CLOSE
        </Text>
      </TouchableOpacity>
      <WebView
        ref={webViewRef}
        source={{uri: WEB3INBOX_URL}}
        style={{flex: 1, borderRadius: 20, marginTop: 32}}
        originWhitelist={['*']}
        onMessage={handleMessage}
      />
    </Modal>
  );
}

// const styles = StyleSheet.create({
//   modalContainer: {
//     display: 'flex',
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: 34,
//     paddingTop: 30,
//     backgroundColor: 'rgba(242, 242, 247, 0.9)',
//     width: '100%',
//     position: 'absolute',
//     bottom: 44,
//   },
// });
