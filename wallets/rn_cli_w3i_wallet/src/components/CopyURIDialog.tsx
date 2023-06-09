import React from 'react';
import {Dimensions, StyleSheet, TextInput, View} from 'react-native';
import Dialog from 'react-native-dialog';
import {ConnectButton} from './ConnectButton';

interface copyURIDialogProps {
  wcURI: string;
  setWCUri: (wcURI: string) => void;
  setVisible: () => void;
  setApprovalModal: () => void;
  visible: boolean;
  pair: () => void;
}
export function CopyURIDialog({
  visible,
  wcURI,
  setWCUri,
  setVisible,
  pair,
}: copyURIDialogProps) {
  const windowWidth = Dimensions.get('window').width;

  return (
    <Dialog.Container
      visible={visible}
      blurComponentIOS
      contentStyle={[styles.mainContainer, {maxWidth: windowWidth * 0.9}]}>
      <View style={styles.contentContainer}>
        <Dialog.Title>Enter a WalletConnect URI</Dialog.Title>
        <View>
          <Dialog.Description style={styles.descriptionText}>
            To get the URI press the copy to clipboard button from your dapp's
            WalletConnect interface.
          </Dialog.Description>
        </View>

        <View style={styles.flexRow}>
          <TextInput
            autoFocus
            style={[styles.textInput, {width: windowWidth * 0.8}]}
            onChangeText={setWCUri}
            value={wcURI}
            placeholder="wc://a13aef..."
            clearButtonMode="always"
            enablesReturnKeyAutomatically
          />
        </View>

        <ConnectButton onPress={pair} />
        <View style={styles.cancelContainer}>
          <Dialog.Button
            style={styles.cancelText}
            label="Cancel"
            onPress={() => setVisible()}
          />
        </View>
      </View>
    </Dialog.Container>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: 'rgba(242, 242, 247, 0.8)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'stretch',
    height: 280,
    padding: 20,
    width: '90%',
    borderRadius: 34,
  },
  contentContainer: {
    display: 'flex',
  },
  textInput: {
    height: 44,
    borderRadius: 15,
    padding: 10,
    marginTop: 16,
    backgroundColor: 'white',
  },
  descriptionText: {
    paddingVertical: 4,
    color: '#798686',
    fontSize: 15,
    lineHeight: 18,
  },
  cancelContainer: {
    height: 46,
    display: 'flex',
  },
  flexRow: {
    flex: 1,
    alignItems: 'stretch',
  },
  cancelText: {
    color: '#3396FF',
    fontWeight: '600',
    fontSize: 20,
    letterSpacing: 0.38,
    lineHeight: 24,
  },
});
