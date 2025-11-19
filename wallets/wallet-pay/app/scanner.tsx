import { CloseModalButton } from '@/components/close-modal-button';
import { ScannerFrame } from '@/components/scanner-frame';
import { Spacing } from '@/constants/spacing';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {
  BarcodeScanningResult,
  CameraView,
  useCameraPermissions,
} from 'expo-camera';

const { width, height } = Dimensions.get('window');
const SCAN_AREA_SIZE = 280; // Size of the transparent square
const FRAME_OVERLAP = 6; // How much the frame overlaps the blur edges
const scanAreaLeft = (width - SCAN_AREA_SIZE) / 2;
const scanAreaTop = (height - SCAN_AREA_SIZE) / 3;
const scanAreaBottom = ((height - SCAN_AREA_SIZE) * 2) / 3;

export default function Scanner() {
  const { top } = useSafeAreaInsets();

  const [permission, requestPermission] = useCameraPermissions();

  const onCodeScanned = (result: BarcodeScanningResult) => {
    const uri = result.data;
    console.log(uri);
  };

  const goBack = () => {
    router.back();
  };

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  return (
    <SafeAreaView style={StyleSheet.absoluteFill}>
      {permission?.granted && (
        <CameraView
          style={StyleSheet.absoluteFill}
          barcodeScannerSettings={{
            barcodeTypes: ['qr', 'ean13'],
          }}
          onBarcodeScanned={onCodeScanned}
        />
      )}
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
        ]}>
        <ScannerFrame size={SCAN_AREA_SIZE + FRAME_OVERLAP * 2} />
      </View>
      <CloseModalButton
        onPress={goBack}
        style={[styles.closeButton, { top: top + Spacing['spacing-8'] }]}
      />
      <View
        style={[
          styles.instructionContainer,
          {
            bottom: scanAreaBottom - Spacing['spacing-12'],
          },
        ]}>
        <Text style={styles.instructionText}>
          {permission?.granted
            ? 'Find a WalletConnect QR Code to scan'
            : 'Camera not available'}
        </Text>
      </View>
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
