import { View, StyleSheet, Image, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { useTheme } from '@/hooks/useTheme';
import { BorderRadius, Spacing } from '@/utils/ThemeUtil';
import { useNfc, isAllowedNfcUri } from '@/hooks/useNfc';
import { usePairing } from '@/hooks/usePairing';

import ModalStore from '@/store/ModalStore';
import BarcodeSvg from '@/assets/Barcode';
import NfcTapSvg from '@/assets/NfcTap';
import { Button } from '@/components/Button';

export function Header() {
  const { top } = useSafeAreaInsets();
  const Theme = useTheme();
  const { isNfcSupported, scanNfcTag } = useNfc();
  const { handleUriOrPaymentLink } = usePairing();

  const onScannerPress = () => {
    ModalStore.open('ScannerOptionsModal', {});
  };

  const onNfcPress = async () => {
    try {
      const uri = await scanNfcTag();
      if (uri) {
        if (!isAllowedNfcUri(uri)) {
          Toast.show({
            type: 'error',
            text1: 'Unrecognized NFC tag',
          });
          return;
        }
        handleUriOrPaymentLink(uri);
      } else {
        Toast.show({
          type: 'info',
          text1: 'No data found on NFC tag',
        });
      }
    } catch {
      Toast.show({
        type: 'error',
        text1: 'NFC scan failed',
      });
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: Platform.OS === 'ios' ? top : top + Spacing[2],
          backgroundColor: Theme['bg-primary'],
        },
      ]}
    >
      <View
        style={[
          styles.logoContainer,
          { backgroundColor: Theme['bg-accent-primary'] },
        ]}
      >
        <Image
          source={require('@/assets/icons/wc-brandmark.png')}
          resizeMode="contain"
          style={styles.logo}
        />
      </View>
      <View style={styles.actions}>
        {Platform.OS === 'ios' && isNfcSupported && (
          <Button
            onPress={onNfcPress}
            style={[
              styles.actionButton,
              styles.nfcButton,
              { borderColor: Theme['border-secondary'] },
            ]}
          >
            <NfcTapSvg width={18} height={18} fill={Theme['icon-invert']} />
          </Button>
        )}
        <Button
          onPress={onScannerPress}
          style={[styles.actionButton, { backgroundColor: Theme['bg-invert'] }]}
        >
          <BarcodeSvg width={18} height={18} fill={Theme['text-invert']} />
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[2],
    justifyContent: 'space-between',
  },
  logoContainer: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 28,
    height: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  actionButton: {
    height: 38,
    width: 38,
    borderRadius: BorderRadius[3],
    alignItems: 'center',
    justifyContent: 'center',
  },
  nfcButton: {
    borderWidth: 1,
  },
  scanIcon: {
    height: 20,
    width: 20,
  },
});
