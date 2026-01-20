import { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { usePairing } from '@/hooks/usePairing';
import ModalStore from '@/store/ModalStore';
import { Text } from '@/components/Text';
import { Spacing, BorderRadius } from '@/utils/ThemeUtil';
import { ActionButton } from '@/components/ActionButton';
import SvgClose from '@/assets/Close';

export default function PasteURIModal() {
  const Theme = useTheme();
  const [uri, setUri] = useState('');
  const { handleUriOrPaymentLink } = usePairing();

  const handleContinue = () => {
    if (!uri.trim()) {
      return;
    }

    ModalStore.close();
    setTimeout(() => {
      handleUriOrPaymentLink(uri);
    }, 500);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardView}
    >
      <View
        style={[styles.container, { backgroundColor: Theme['bg-primary'] }]}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => ModalStore.close()}
            style={[
              styles.closeButton,
              { borderColor: Theme['border-secondary'] },
            ]}
          >
            <SvgClose width={38} height={38} fill={Theme['text-primary']} />
          </TouchableOpacity>
        </View>

        <Text variant="h6-400" color="text-primary" center>
          Paste URI or Payment Link
        </Text>

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: Theme['bg-primary'],
              color: Theme['text-primary'],
              borderColor: Theme['foreground-tertiary'],
            },
          ]}
          placeholder="wc:// or https://pay.walletconnect.com/..."
          placeholderTextColor={Theme['text-secondary']}
          value={uri}
          onChangeText={setUri}
          multiline
          numberOfLines={4}
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus
        />

        <View style={styles.buttonContainer}>
          <ActionButton
            style={styles.button}
            onPress={() => ModalStore.close()}
            variant="secondary"
          >
            Cancel
          </ActionButton>

          <ActionButton
            style={styles.button}
            onPress={handleContinue}
            disabled={!uri.trim()}
          >
            Continue
          </ActionButton>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    width: '100%',
  },
  container: {
    width: '100%',
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    alignItems: 'center',
    padding: Spacing[5],
    paddingBottom: Spacing[8],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
    marginBottom: Spacing[4],
  },
  closeButton: {
    borderWidth: 1,
    borderRadius: BorderRadius[3],
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius[3],
    padding: Spacing[4],
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 14,
    width: '100%',
    marginTop: Spacing[4],
    marginHorizontal: Spacing[4],
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: Spacing[3],
    width: '100%',
    paddingTop: Spacing[4],
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: BorderRadius[3],
    alignItems: 'center',
  },
});
