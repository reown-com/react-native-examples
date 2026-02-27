import { View, StyleSheet, Image, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/useTheme';
import { BorderRadius, Spacing } from '@/utils/ThemeUtil';

import ModalStore from '@/store/ModalStore';
import BarcodeSvg from '@/assets/Barcode';
import { Button } from '@/components/Button';

export function Header() {
  const { top } = useSafeAreaInsets();
  const Theme = useTheme();

  const onScannerPress = () => {
    ModalStore.open('ScannerOptionsModal', {});
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
      <Button
        onPress={onScannerPress}
        style={[styles.scanButton, { backgroundColor: Theme['bg-invert'] }]}
      >
        <BarcodeSvg width={18} height={18} fill={Theme['text-invert']} />
      </Button>
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
  scanButton: {
    height: 38,
    width: 38,
    borderRadius: BorderRadius[3],
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanIcon: {
    height: 20,
    width: 20,
  },
});
