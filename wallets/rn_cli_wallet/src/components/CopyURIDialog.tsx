import { useState } from 'react';
import { Dimensions, StyleSheet, TextInput, View } from 'react-native';
import Dialog from 'react-native-dialog';

import { useTheme } from '@/hooks/useTheme';
import { ConnectButton } from './ConnectButton';
import { Spacing, BorderRadius } from '@/utils/ThemeUtil';

interface copyURIDialogProps {
  visible: boolean;
  onConnect: (uri: string) => void;
  onCancel: () => void;
}
export function CopyURIDialog({
  visible,
  onConnect,
  onCancel,
}: copyURIDialogProps) {
  const Theme = useTheme();
  const windowWidth = Dimensions.get('window').width;
  const [uri, setUri] = useState<string>('');

  const clear = () => {
    setUri('');
  };

  const handleConnect = () => {
    onConnect(uri);
    clear();
  };

  const handleCancel = () => {
    onCancel();
    clear();
  };

  return (
    <Dialog.Container
      visible={visible}
      onRequestClose={handleCancel}
      onBackdropPress={handleCancel}
      useNativeDriver
      contentStyle={[
        styles.mainContainer,
        {
          maxWidth: windowWidth * 0.9,
          backgroundColor: Theme['foreground-secondary'],
        },
      ]}
    >
      <View>
        <Dialog.Title
          style={[styles.titleText, { color: Theme['text-primary'] }]}
        >
          Paste URI or Payment Link
        </Dialog.Title>
        <Dialog.Description
          style={[styles.descriptionText, { color: Theme['text-secondary'] }]}
        >
          Paste a WalletConnect URI or a WalletConnect Pay link to continue.
        </Dialog.Description>

        <View style={styles.flexRow}>
          <TextInput
            autoFocus
            style={[
              styles.textInput,
              {
                width: windowWidth * 0.8,
                backgroundColor: Theme['bg-primary'],
                color: Theme['text-primary'],
              },
            ]}
            placeholderTextColor={Theme['text-secondary']}
            onChangeText={setUri}
            placeholder="wc://... or https://pay.walletconnect.com/..."
            clearButtonMode="always"
            enablesReturnKeyAutomatically
            autoCapitalize="none"
          />
        </View>

        <ConnectButton
          onPress={handleConnect}
          disabled={!uri}
          style={styles.connectButton}
        />
        <View style={styles.cancelContainer}>
          <Dialog.Button
            style={[styles.cancelText, { color: Theme['text-accent-primary'] }]}
            label="Cancel"
            onPress={handleCancel}
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
    padding: Spacing[5],
    width: '90%',
    borderRadius: BorderRadius[8],
  },
  textInput: {
    height: 44,
    borderRadius: BorderRadius[4],
    padding: Spacing[3],
    marginTop: Spacing[4],
  },
  titleText: {
    fontSize: 24,
    textAlign: 'center',
  },
  descriptionText: {
    textAlign: 'center',
    paddingVertical: Spacing[1],
    fontSize: 14,
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
    marginVertical: Spacing[1],
  },
});
