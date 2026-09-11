import { CameraView } from 'expo-camera';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import SvgClose from '@/assets/Close';
import { RootStackScreenProps } from '@/utils/TypesUtil';
import styles, { SCAN_AREA_SIZE } from './styles';
import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';
import { haptics } from '@/utils/haptics';
import { Button } from '@/components/Button';
import { ScannerFrame } from '@/components/ScannerFrame';
import { Spacing } from '@/utils/ThemeUtil';

const CUTOUT_RADIUS = 16;

type Props = RootStackScreenProps<'Scan'>;

export default function Scan({ navigation }: Props) {
  const Theme = useTheme();
  const { top } = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const isFocused = useIsFocused();
  const [isCameraEnabled, setIsCameraEnabled] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scannedUri, setScannedUri] = useState<string | null>(null);
  const hasHandledScan = useRef(false);
  const scanAreaLeft = (screenWidth - SCAN_AREA_SIZE) / 2;
  const scanAreaTop = (screenHeight - SCAN_AREA_SIZE) / 3;

  const onBarcodeScanned = useCallback(({ data }: { data: string }) => {
    if (hasHandledScan.current || !data) return;

    hasHandledScan.current = true;
    haptics.scanSuccess();
    // Unmount the web camera before navigating. Its scanner runs on a timer,
    // and navigating from inside that callback can leave React mid-render.
    setIsCameraEnabled(false);
    setScannedUri(data);
  }, []);

  useEffect(() => {
    if (!scannedUri) return;

    const frame = requestAnimationFrame(() => {
      navigation.navigate('Home', {
        screen: 'Connections',
        params: { uri: scannedUri },
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [navigation, scannedUri]);

  const requestCameraPermission = useCallback(async () => {
    setCameraError(null);
    if (
      typeof window === 'undefined' ||
      !window.isSecureContext ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      setCameraError(
        'Camera access requires HTTPS or localhost in this browser.',
      );
      return;
    }

    try {
      // Safari only displays its camera prompt while the request is tied to a user gesture.
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: 'environment' } },
      });
      stream.getTracks().forEach(track => track.stop());
      setIsCameraEnabled(true);
    } catch (error) {
      switch (error instanceof DOMException ? error.name : '') {
        case 'NotAllowedError':
          setCameraError(
            'Camera access was denied. Allow it in Safari settings, then try again.',
          );
          break;
        case 'NotFoundError':
          setCameraError('No camera is available on this device.');
          break;
        case 'NotReadableError':
          setCameraError(
            'Camera is in use by another app. Close it, then try again.',
          );
          break;
        default:
          setCameraError('Camera access could not be started.');
      }
    }
  }, []);

  const goBack = () => {
    navigation.goBack();
  };

  return (
    <View style={[StyleSheet.absoluteFill, styles.container]}>
      {isCameraEnabled ? (
        <CameraView
          active={isFocused}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={onBarcodeScanned}
          onMountError={({ message }) => {
            setCameraError(message);
            setIsCameraEnabled(false);
          }}
          style={StyleSheet.absoluteFill}
          testID="camera-wc-qr"
        />
      ) : null}

      <Svg
        style={[StyleSheet.absoluteFill, styles.overlay]}
        width={screenWidth}
        height={screenHeight}
      >
        <Path
          d={`M0,0 L${screenWidth},0 L${screenWidth},${screenHeight} L0,${screenHeight} Z M${
            scanAreaLeft + CUTOUT_RADIUS
          },${scanAreaTop} L${
            scanAreaLeft + SCAN_AREA_SIZE - CUTOUT_RADIUS
          },${scanAreaTop} Q${scanAreaLeft + SCAN_AREA_SIZE},${scanAreaTop} ${
            scanAreaLeft + SCAN_AREA_SIZE
          },${scanAreaTop + CUTOUT_RADIUS} L${scanAreaLeft + SCAN_AREA_SIZE},${
            scanAreaTop + SCAN_AREA_SIZE - CUTOUT_RADIUS
          } Q${scanAreaLeft + SCAN_AREA_SIZE},${scanAreaTop + SCAN_AREA_SIZE} ${
            scanAreaLeft + SCAN_AREA_SIZE - CUTOUT_RADIUS
          },${scanAreaTop + SCAN_AREA_SIZE} L${scanAreaLeft + CUTOUT_RADIUS},${
            scanAreaTop + SCAN_AREA_SIZE
          } Q${scanAreaLeft},${scanAreaTop + SCAN_AREA_SIZE} ${scanAreaLeft},${
            scanAreaTop + SCAN_AREA_SIZE - CUTOUT_RADIUS
          } L${scanAreaLeft},${
            scanAreaTop + CUTOUT_RADIUS
          } Q${scanAreaLeft},${scanAreaTop} ${
            scanAreaLeft + CUTOUT_RADIUS
          },${scanAreaTop} Z`}
          fill="rgba(0,0,0,0.9)"
          fillRule="evenodd"
        />
      </Svg>

      <View
        style={[
          styles.scanFrame,
          { top: scanAreaTop - 14, left: scanAreaLeft - 14 },
        ]}
      >
        <ScannerFrame size={SCAN_AREA_SIZE + 28} />
      </View>

      <Button
        onPress={goBack}
        style={[
          styles.closeButton,
          { top: top + 12, borderColor: Theme['border-secondary'] },
        ]}
        hitSlop={40}
      >
        <SvgClose fill="white" height={14} width={14} />
      </Button>

      <View
        style={[
          styles.instructionContainer,
          { top: scanAreaTop + SCAN_AREA_SIZE + Spacing[8] },
        ]}
      >
        <Text variant="lg-400" style={styles.instructionText}>
          Scan a WalletConnect QR code
        </Text>
      </View>

      {!isCameraEnabled && (
        <>
          <View pointerEvents="none" style={styles.errorContainer}>
            <Text
              variant="lg-400"
              color="text-invert"
              style={webStyles.errorText}
            >
              {cameraError ||
                'Camera unavailable. Allow camera access to scan codes.'}
            </Text>
          </View>
          <Button
            accessibilityLabel="Allow camera access"
            onPress={requestCameraPermission}
            style={[
              webStyles.allowCameraButton,
              { top: scanAreaTop + SCAN_AREA_SIZE + Spacing[12] },
            ]}
            testID="button-allow-camera"
          >
            <Text variant="md-500" color="text-invert">
              Allow camera access
            </Text>
          </Button>
        </>
      )}
    </View>
  );
}

const webStyles = StyleSheet.create({
  errorText: {
    textAlign: 'center',
    paddingHorizontal: Spacing[5],
  },
  allowCameraButton: {
    position: 'absolute',
    alignSelf: 'center',
    borderColor: 'white',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
  },
});
