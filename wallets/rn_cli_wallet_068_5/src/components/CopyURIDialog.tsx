import React from 'react';
import {Button, StyleSheet, TextInput, View} from 'react-native';
import Dialog from 'react-native-dialog';
import {ConnectButton} from './ConnectButton';

interface copyURIDialogProps {
  wcURI: string;
  setWCUri: (arg0: string) => void;
  setVisible: () => void;
  setApprovalModal: (argo0: bool) => void;
  visible: boolean;
  pair: () => void;
}
export function CopyURIDialog({
  visible,
  wcURI,
  setWCUri,
  setVisible,
  setApprovalModal,
  pair,
}: copyURIDialogProps) {
  console.log('visible', visible);

  return (
    <View>
      <Dialog.Container
        visible={visible}
        blurComponentIOS
        contentStyle={{
          backgroundColor: 'rgba(242, 242, 247, 0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 250,
        }}>
        <Dialog.Title>Enter a WalletConnect URI</Dialog.Title>
        <View>
          <Dialog.Description>
            To get the URI press the 📋 copy to clipboard button in wallet
            connection interfaces.
          </Dialog.Description>
        </View>
        <View
          style={{
            marginTop: 8,
            marginBottom: 16,
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <TextInput
            autoFocus
            style={styles.textInput}
            onChangeText={setWCUri}
            value={wcURI}
            placeholder="wc://a13aef..."
            enablesReturnKeyAutomatically
          />
        </View>
        <ConnectButton onPress={pair} />
        <Dialog.Button label="Cancel" onPress={() => setVisible()} />
      </Dialog.Container>
    </View>
  );
}

const styles = StyleSheet.create({
  blueButtonContainer: {
    marginBottom: 48,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    height: 56,
    width: 350,
    boxShadow:
      '0px 6px 14px -6px rgba(0, 0, 0, 0.12), 0px 10px 32px -4px rgba(0, 0, 0, 0.1)',
  },
  textInput: {
    height: 44,
    borderRadius: 15,
    padding: 10,
    width: 220,
    marginTop: 16,
    // width: '80%',
    backgroundColor: 'white',
  },
  mainText: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '600',
    color: 'white',
  },
  imageContainer: {
    width: 24,
    height: 24,
  },
});
