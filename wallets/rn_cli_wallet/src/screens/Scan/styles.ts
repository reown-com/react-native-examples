import { StyleSheet } from 'react-native';
import { BorderRadius, Spacing } from '@/utils/ThemeUtil';

export const SCAN_AREA_SIZE = 280;

export default StyleSheet.create({
  overlay: {
    left: -1,
    top: -1,
  },
  scanFrame: {
    position: 'absolute',
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
