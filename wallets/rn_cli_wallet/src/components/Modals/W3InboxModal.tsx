import React from 'react';
import {TouchableOpacity, Text} from 'react-native';
import Modal from 'react-native-modal';
import {WebView} from 'react-native-webview';
// import {currentETHAddress} from '../../utils/Web3WalletClient';

interface W3InboxModalProps {
  visible: boolean;
  setVisible: (arg0: boolean) => void;
}

export function W3InboxModal({visible, setVisible}: W3InboxModalProps) {
  // Example: https://web3inbox-dev-hidden.vercel.app/?chatProvider=reactnative&account=0x8276354791253408612634
  const WEB3INBOX_URL = 'https://web3inbox-dev-hidden.vercel.app/';
  // const WEB3INBOX_PROVIDER_TYPE_KEY = '?chatProvider';
  // const WEB3INBOX_PROVIDER_TYPE_VALUE = '=reactnative';
  // Need to add in the extra PushProvider / AuthProvider?

  // Note: currentEthAddress is related to the createOrRestoreEIP155Wallet() in Web3WalletClient.ts
  // const WEB3INBOX_ACCOUNT_KEY = `&account=${currentETHAddress}`;
  // const WEB3INBOX_JS_SIDE_PROXY_NAME = 'reactnative';
  // const finalLink =
  //   WEB3INBOX_URL + WEB3INBOX_PROVIDER_TYPE_KEY + WEB3INBOX_PROVIDER_TYPE_VALUE;

  // console.log('finalLink', finalLink);

  return (
    <Modal backdropOpacity={0.6} isVisible={visible}>
      <TouchableOpacity
        style={{paddingTop: 20}}
        onPress={() => setVisible(!visible)}
        hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
        <Text style={{color: 'red'}}>CLOSE</Text>
      </TouchableOpacity>
      <WebView
        // source={{uri: finalLink}}
        source={{uri: WEB3INBOX_URL}}
        style={{flex: 1, borderRadius: 20, marginTop: 32}}
      />
    </Modal>
  );
}
