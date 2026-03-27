import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { BorderRadius, Spacing } from '@/constants/spacing';
import { useTheme } from '@/hooks/use-theme-color';
import { Button } from './primitives/button';
import { router } from 'expo-router';

export function Header() {
  const { top } = useSafeAreaInsets();
  const Theme = useTheme();

  const onCameraPress = () => {
    router.navigate('/scanner');
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: top, backgroundColor: Theme['bg-primary'] },
      ]}>
      <View
        style={[
          styles.logoContainer,
          { backgroundColor: Theme['bg-accent-primary'] },
        ]}>
        <Image
          source={require('@/assets/icons/wc-brandmark.png')}
          contentFit="contain"
          style={styles.logo}
        />
      </View>
      <Button
        onPress={onCameraPress}
        style={[styles.closeButton, { backgroundColor: Theme['bg-invert'] }]}>
        <Image
          source={require('@/assets/icons/barcode.png')}
          contentFit="contain"
          style={styles.closeIcon}
          cachePolicy="memory-disk"
          tintColor={Theme['text-invert']}
          priority="high"
        />
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing['spacing-5'],
    justifyContent: 'space-between',
  },
  logoContainer: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius['full'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 28,
    height: 18,
  },
  closeButton: {
    height: 38,
    width: 38,
    borderRadius: BorderRadius['3'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    height: 20,
    width: 20,
  },
});
