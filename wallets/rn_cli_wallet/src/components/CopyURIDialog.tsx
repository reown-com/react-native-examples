import React, {useState} from 'react';
import {Dimensions, StyleSheet, TextInput, View} from 'react-native';
import Dialog from 'react-native-dialog';
import {ConnectButton} from './ConnectButton';
import {useTheme} from '../hooks/useTheme';

interface copyURIDialogProps {
  setVisible: () => void;
  visible: boolean;
  pair: (uri: string) => void;
}
export function CopyURIDialog({visible, setVisible, pair}: copyURIDialogProps) {
  const Theme = useTheme();
  const windowWidth = Dimensions.get('window').width;
  const [uri, setUri] = useState<string>('');

  const onClose = () => {
    setVisible();
    setUri('');
  };

  const onPair = () => {
    pair(uri);
    onClose();
  };

  return (
    <Dialog.Container
      visible={visible}
      useNativeDriver
      contentStyle={[
        styles.mainContainer,
        {maxWidth: windowWidth * 0.9, backgroundColor: Theme['bg-175']},
      ]}>
      <View>
        <Dialog.Title style={[styles.titleText, {color: Theme['fg-100']}]}>
          Enter a WalletConnect URI
        </Dialog.Title>
        <Dialog.Description
          style={[styles.descriptionText, {color: Theme['fg-150']}]}>
          To get the URI press the copy to clipboard button from your dapp's
          WalletConnect interface.
        </Dialog.Description>

        <View style={styles.flexRow}>
          <TextInput
            autoFocus
            style={[
              styles.textInput,
              {width: windowWidth * 0.8, backgroundColor: Theme['bg-100']},
            ]}
            onChangeText={setUri}
            placeholder="wc://a13aef..."
            clearButtonMode="always"
            enablesReturnKeyAutomatically
            autoCapitalize="none"
          />
        </View>

        <ConnectButton
          onPress={onPair}
          disabled={!uri}
          style={styles.connectButton}
        />
        <View style={styles.cancelContainer}>
          <Dialog.Button
            style={[styles.cancelText, {color: Theme['accent-100']}]}
            label="Cancel"
            onPress={onClose}
          />
        </View>
      </View>
    </Dialog.Container>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    justifyContent: 'center',
    alignItems: 'stretch',
    height: 320,
    padding: 20,
    width: '90%',
    borderRadius: 34,
  },
  textInput: {
    height: 44,
    borderRadius: 15,
    padding: 10,
    marginTop: 16,
  },
  titleText: {
    fontFamily: 'SFProRounded-Medium',
    fontSize: 24,
    textAlign: 'center',
  },
  descriptionText: {
    fontFamily: 'SFProRounded-Medium',
    textAlign: 'center',
    paddingVertical: 4,
    fontSize: 15,
    lineHeight: 18,
  },
  cancelContainer: {
    height: 46,
  },
  flexRow: {
    flex: 1,
    alignItems: 'stretch',
  },
  cancelText: {
    fontWeight: '600',
    fontSize: 20,
    letterSpacing: 0.38,
    lineHeight: 24,
    textTransform: 'capitalize',
  },
  connectButton: {
    marginVertical: 4,
  },
});
