import { useEffect } from 'react';
import {
  Dimensions,
  Platform,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';

import {
  Camera,
  Code,
  useCameraDevice,
  useCodeScanner,
  useCameraPermission,
} from 'react-native-vision-camera';
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
  // Subscribe to window changes so we re-render on rotation/foldables/multi-window.
  // On Android we then read 'screen' dimensions to include the navigation bar area
  // for the edge-to-edge overlay; on iOS the window value is what we want.
  const windowDims = useWindowDimensions();
  const { width: rawWidth, height: rawHeight } =
    Platform.OS === 'android' ? Dimensions.get('screen') : windowDims;
  // Small buffer to avoid sub-pixel gaps on devices with non-integer pixel ratios
  const screenWidth = rawWidth + 2;
  const screenHeight = rawHeight + 2;
  const scanAreaLeft = (rawWidth - SCAN_AREA_SIZE) / 2;
  const scanAreaTop = (rawHeight - SCAN_AREA_SIZE) / 3;

  const device = useCameraDevice('back', {
    physicalDevices: ['wide-angle-camera'],
  });
  const { hasPermission, requestPermission } = useCameraPermission();

  const isActive = useIsFocused();

  const onCodeScanned = (codes: Code[]) => {
    const uri = codes[0]?.value;
    if (!uri) return;
    haptics.scanSuccess();
    navigation.navigate('Home', {
      screen: 'Connections',
      params: { uri },
    });
  };

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned,
  });

  const goBack = () => {
    navigation.goBack();
  };

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  return (
    <View style={[StyleSheet.absoluteFill, styles.container]}>
      {hasPermission && device ? (
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={isActive}
          codeScanner={codeScanner}
        />
      ) : (
        <View style={styles.errorContainer}>
          <Text variant="lg-400" color="text-invert">
            Camera unavailable. Enable camera access in Settings.
          </Text>
        </View>
      )}

      {/* Dark overlay with rounded cutout */}
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

      {/* Scanner frame corners */}
      <View
        style={[
          styles.scanFrame,
          { top: scanAreaTop - 14, left: scanAreaLeft - 14 },
        ]}
      >
        <ScannerFrame size={SCAN_AREA_SIZE + 28} />
      </View>

      {/* Close button */}
      <Button
        onPress={goBack}
        style={[
          styles.closeButton,
          {
            top: top + 12,
            borderColor: Theme['border-secondary'],
          },
        ]}
        hitSlop={40}
      >
        <SvgClose fill="white" height={14} width={14} />
      </Button>

      {/* Instruction text */}
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
    </View>
  );
}
