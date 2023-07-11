import {Linking, Alert} from 'react-native';

export const handleDeepLinkRedirect = (redirect?: {
  native?: string;
  universal?: string;
}) => {
  try {
    if (redirect?.native) {
      Linking.openURL(redirect.native).catch(() => {
        // Fallback to universal link
        if (redirect?.universal) {
          Linking.openURL(redirect.universal);
        } else {
          Alert.alert('Failed to redirect', 'Please go back to dapp manually');
        }
      });
    } else if (redirect?.universal) {
      Linking.openURL(redirect.universal);
    } else {
      Alert.alert('Failed to redirect', 'Please go back to dapp manually');
    }
  } catch (error) {
    console.log(error);
    Alert.alert('Failed to redirect', 'Please go back to dapp manually');
  }
};
