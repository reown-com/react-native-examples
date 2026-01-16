import { StyleSheet } from 'react-native';
import { Spacing } from '@/utils/ThemeUtil';

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing[4],
  },
  reviewText: {
    marginBottom: Spacing[2],
  },
  datesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: Spacing[4],
  },
  actionsContainer: {
    rowGap: Spacing[4],
    alignItems: 'center',
    width: '100%',
  },
  action: {
    width: '100%',
  },
  permissions: {
    maxHeight: '100%',
  },
});
