import { StyleSheet } from 'react-native';
import { Spacing } from '@/utils/ThemeUtil';

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing[4],
    paddingBottom: Spacing[4],
  },
  smallMarginTop: {
    marginTop: Spacing[4],
  },
  subtitle: {
    marginVertical: Spacing[4],
  },
  sectionContainer: {
    rowGap: Spacing[2],
  },
});
