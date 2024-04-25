import {StyleSheet} from 'react-native';

export default StyleSheet.create({
  destructiveButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  destructiveButtonText: {
    color: 'white',
    fontWeight: '500',
    marginHorizontal: 16,
  },
  scopeContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    borderBottomWidth: 0.5,
    paddingHorizontal: 16,
  },
  scopeContainerNoBorder: {
    borderBottomWidth: 0,
  },
  scopeContentContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 16,
  },
  scopeTitle: {
    width: '100%',
    fontSize: 18,
    fontWeight: '500',
  },
  scopeDescription: {
    width: '100%',
    fontSize: 12,
    fontWeight: '400',
    marginBottom: 8,
  },
});
