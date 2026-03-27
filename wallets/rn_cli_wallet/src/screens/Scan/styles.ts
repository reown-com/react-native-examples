import { StyleSheet } from 'react-native';
import { Spacing, BorderRadius } from '@/utils/ThemeUtil';

export default StyleSheet.create({
  backButton: {
    zIndex: 1,
    backgroundColor: 'black',
    opacity: 0.7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius[6],
    height: Spacing[9],
    width: Spacing[9],
    marginTop: Spacing[4],
    marginLeft: Spacing[4],
  },
  backIcon: {
    transform: [{ rotate: '180deg' }],
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
