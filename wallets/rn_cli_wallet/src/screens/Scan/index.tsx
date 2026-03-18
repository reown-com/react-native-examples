import { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';

import {
  Camera,
  Code,
  useCameraDevice,
  useCodeScanner,
  useCameraPermission,
} from 'react-native-vision-camera';
import { useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Defs, ClipPath, Rect } from 'react-native-svg';

import SvgClose from '@/assets/Close';
import { RootStackScreenProps } from '@/utils/TypesUtil';
import styles, { SCAN_AREA_SIZE, scanAreaLeft, scanAreaTop } from './styles';
import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';
import { haptics } from '@/utils/haptics';
import { Button } from '@/components/Button';
import { ScannerFrame } from '@/components/ScannerFrame';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const CUTOUT_RADIUS = 16;

type Props = RootStackScreenProps<'Scan'>;

export default function Scan({ navigation }: Props) {
  const Theme = useTheme();
  const { top } = useSafeAreaInsets();
  const device = useCameraDevice('back', {
    physicalDevices: ['wide-angle-camera'],
  });
  const { hasPermission, requestPermission } = useCameraPermission();

  const isActive = useIsFocused();

  const onCodeScanned = (codes: Code[]) => {
    haptics.scanSuccess();
    const uri = codes[0].value;
    navigation.navigate('Home', {
      screen: 'Connections',
      params: { uri: uri! },
    });
  };

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],
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
            Camera not available
          </Text>
        </View>
      )}

      {/* Dark overlay with rounded cutout */}
      <Svg
        style={StyleSheet.absoluteFill}
        width={screenWidth}
        height={screenHeight}
      >
        <Defs>
          <ClipPath id="overlay">
            <Rect x={0} y={0} width={screenWidth} height={screenHeight} />
          </ClipPath>
        </Defs>
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
      <View style={styles.scanFrame}>
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
      <View style={styles.instructionContainer}>
        <Text variant="lg-400" style={styles.instructionText}>
          Find a WalletConnect QR Code to scan
        </Text>
      </View>
    </View>
  );
}
