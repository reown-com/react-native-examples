import React from 'react';
import {TouchableOpacity, Text} from 'react-native';
import Modal from 'react-native-modal';
// import {SafeAreaView} from 'react-native-safe-area-context';
import {WebView} from 'react-native-webview';

interface W3InboxModalProps {
  visible: boolean;
  setVisible: (arg0: boolean) => void;
}

export function W3InboxModal({visible, setVisible}: W3InboxModalProps) {
  return (
    <Modal backdropOpacity={0.6} isVisible={visible}>
      <TouchableOpacity onPress={() => setVisible(false)}>
        <Text style={{color: 'red', marginTop: 20}}>CLOSE</Text>
      </TouchableOpacity>
      <WebView
        source={{uri: 'https://web3inbox-dev-hidden.vercel.app/login'}}
        style={{flex: 1, borderRadius: 20, marginTop: 32}}
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
