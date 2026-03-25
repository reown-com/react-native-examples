import { Dimensions, Platform, StyleSheet } from 'react-native';
import { BorderRadius, Spacing } from '@/utils/ThemeUtil';

const { width, height } = Dimensions.get(
  Platform.OS === 'android' ? 'screen' : 'window',
);

export const SCAN_AREA_SIZE = 280;
export const scanAreaLeft = (width - SCAN_AREA_SIZE) / 2;
export const scanAreaTop = (height - SCAN_AREA_SIZE) / 3;

export default StyleSheet.create({
  scanFrame: {
    position: 'absolute',
    top: scanAreaTop - 14,
    left: scanAreaLeft - 14,
    width: SCAN_AREA_SIZE + 28,
    height: SCAN_AREA_SIZE + 28,
  },
  closeButton: {
    position: 'absolute',
    right: Spacing[5],
    alignItems: 'center',
    justifyContent: 'center',
    width: 38,
    height: 38,
    borderRadius: BorderRadius[3],
    borderWidth: 1,
    zIndex: 2,
  },
  instructionContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: scanAreaTop + SCAN_AREA_SIZE + Spacing[8],
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionText: {
    color: 'white',
  },
  container: {
    backgroundColor: 'black',
  },
});
