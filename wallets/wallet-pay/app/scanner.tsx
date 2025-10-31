import { Button } from '@/components/primitives/button';
import { ScannerFrame } from '@/components/scanner-frame';
import { BorderRadius, Spacing } from '@/constants/spacing';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useIsFocused } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {
  Camera,
  Code,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from 'react-native-vision-camera';

const { width, height } = Dimensions.get('window');
const SCAN_AREA_SIZE = 280; // Size of the transparent square
const FRAME_OVERLAP = 6; // How much the frame overlaps the blur edges
const scanAreaLeft = (width - SCAN_AREA_SIZE) / 2;
const scanAreaTop = (height - SCAN_AREA_SIZE) / 3;
const scanAreaBottom = ((height - SCAN_AREA_SIZE) * 2) / 3;

export default function Scanner() {
  const closeBorderColor = useThemeColor('border-secondary');
  const { top } = useSafeAreaInsets();
  const device = useCameraDevice('back', {
    physicalDevices: ['wide-angle-camera'],
  });
  const { hasPermission, requestPermission } = useCameraPermission();

  const isActive = useIsFocused();

  const onCodeScanned = (codes: Code[]) => {
    const uri = codes[0].value;
    console.log(uri);
  };

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],
    onCodeScanned,
  });

  const goBack = () => {
    router.back();
  };

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  return (
    <SafeAreaView style={StyleSheet.absoluteFill}>
      {hasPermission && device ? (
        <>
          <Camera
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={isActive}
            codeScanner={codeScanner}
          />
          {/* Top blur overlay */}
          <BlurView
            intensity={80}
            style={[styles.blurOverlay, { top: 0, height: scanAreaTop }]}
            tint="dark"
          />
          {/* Left blur overlay */}
          <BlurView
            intensity={80}
            style={[
              styles.blurOverlay,
              {
                top: scanAreaTop,
                left: 0,
                width: scanAreaLeft,
                height: SCAN_AREA_SIZE,
              },
            ]}
            tint="dark"
          />
          {/* Bottom blur overlay */}
          <BlurView
            intensity={80}
            style={[styles.blurOverlay, { bottom: 0, height: scanAreaBottom }]}
            tint="dark"
          />
          {/* Right blur overlay */}
          <BlurView
            intensity={80}
            style={[
              styles.blurOverlay,
              {
                top: scanAreaTop,
                right: 0,
                width: scanAreaLeft,
                height: SCAN_AREA_SIZE,
              },
            ]}
            tint="dark"
          />

          <View
            style={[
              styles.scanAreaContainer,
              {
                top: scanAreaTop - FRAME_OVERLAP,
                left: scanAreaLeft - FRAME_OVERLAP,
                width: SCAN_AREA_SIZE + FRAME_OVERLAP * 2,
                height: SCAN_AREA_SIZE + FRAME_OVERLAP * 2,
              },
            ]}
          >
            <ScannerFrame size={SCAN_AREA_SIZE + FRAME_OVERLAP * 2} />
          </View>

          <Button
            onPress={goBack}
            hitSlop={10}
            style={[
              styles.closeButton,
              {
                borderColor: closeBorderColor,
                top: top + Spacing['spacing-8'],
              },
            ]}
          >
            <Image
              source={require('@/assets/icons/close.png')}
              style={styles.closeIcon}
            />
          </Button>

          <View
            style={[
              styles.instructionContainer,
              {
                bottom: scanAreaBottom - Spacing['spacing-12'],
              },
            ]}
          >
            <Text style={styles.instructionText}>
              Find a WalletConnect QR Code to scan
            </Text>
          </View>
        </>
      ) : (
        <View style={styles.errorContainer}>
          <Text>Camera not available</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blurOverlay: {
    position: 'absolute',
    width: '100%',
  },
  scanAreaContainer: {
    position: 'absolute',
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    borderWidth: 1,
    borderRadius: BorderRadius['3'],
    padding: Spacing['spacing-3'],
  },
  closeIcon: {
    width: 16,
    height: 16,
  },
  instructionContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  instructionText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
