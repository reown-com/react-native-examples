import {StyleSheet} from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  reviewText: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 8,
  },
  datesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateText: {
    fontWeight: '600',
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: 16,
  },
  actionsContainer: {
    rowGap: 16,
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
