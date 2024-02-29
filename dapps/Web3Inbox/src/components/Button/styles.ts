import {StyleSheet} from 'react-native';
import {BorderRadius, Spacing} from '@/utils/ThemeUtil';

export default StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.m,
    paddingVertical: Spacing.s,
    paddingHorizontal: Spacing.xl,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
});
