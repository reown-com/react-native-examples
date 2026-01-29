import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { useTheme } from '@/hooks/useTheme';
import ModalStore from '@/store/ModalStore';
import { Text } from '@/components/Text';
import { ModalCloseButton } from '@/components/ModalCloseButton';
import { Spacing, BorderRadius } from '@/utils/ThemeUtil';
import BarcodeSvg from '@/assets/Barcode';
import PasteSvg from '@/assets/Paste';
import Clipboard from '@react-native-clipboard/clipboard';
import { usePairing } from '@/hooks/usePairing';
import Toast from 'react-native-toast-message';
import { Button } from '@/components/Button';

export default function ScannerOptionsModal() {
  const Theme = useTheme();
  const navigation = useNavigation();
  const { handleUriOrPaymentLink } = usePairing();

  const onScanPress = () => {
    ModalStore.close();
    setTimeout(() => {
      navigation.navigate('Scan');
    }, 300);
  };

  const onPastePress = () => {
    Clipboard.getString()
      .then(url => {
        if (!url.trim()) {
          Toast.show({
            type: 'info',
            text1: 'No URL found in clipboard',
          });
          return;
        }

        ModalStore.close();
        setTimeout(() => {
          handleUriOrPaymentLink(url);
        }, 300);
      })
      .catch(() => {
        ModalStore.close();
        Toast.show({
          type: 'error',
          text1: 'Failed to read clipboard',
        });
      });
  };

  return (
    <View style={[styles.container, { backgroundColor: Theme['bg-primary'] }]}>
      <View style={styles.header}>
        <ModalCloseButton onPress={() => ModalStore.close()} />
      </View>

      <View style={styles.optionsContainer}>
        <Button
          onPress={onScanPress}
          style={[
            styles.optionButton,
            { backgroundColor: Theme['foreground-primary'] },
          ]}
        >
          <Text variant="lg-400" color="text-primary">
            Scan QR code
          </Text>
          <BarcodeSvg width={24} height={24} fill={Theme['text-primary']} />
        </Button>

        <Button
          onPress={onPastePress}
          style={[
            styles.optionButton,
            { backgroundColor: Theme['foreground-primary'] },
          ]}
        >
          <Text variant="lg-400" color="text-primary">
            Paste a URL
          </Text>
          <PasteSvg width={24} height={24} fill={Theme['text-primary']} />
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
    padding: Spacing[5],
  },
  title: {
    marginVertical: Spacing[4],
    textAlign: 'center',
  },
  optionsContainer: {
    width: '100%',
    paddingHorizontal: Spacing[4],
    paddingBottom: Spacing[8],
    gap: Spacing[3],
  },
  optionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 76,
    paddingHorizontal: Spacing[6],
    borderRadius: BorderRadius[4],
  },
});
