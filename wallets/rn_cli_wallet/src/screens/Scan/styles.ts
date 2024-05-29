import {StyleSheet} from 'react-native';

export default StyleSheet.create({
  backButton: {
    zIndex: 1,
    backgroundColor: 'black',
    opacity: 0.7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    height: 36,
    width: 36,
    marginTop: 16,
    marginLeft: 16,
  },
  backIcon: {
    transform: [{rotate: '180deg'}],
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
