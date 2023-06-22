import {CoreTypes} from '@walletconnect/types';
import {Alert, Linking} from 'react-native';

export const handleDeepLinkRedirect = (metadata?: CoreTypes.Metadata) => {
  try {
    const redirect = metadata?.redirect;
    if (redirect?.native) {
      Linking.openURL(redirect.native).catch(() => {
        // Fallback to universal link
        if (redirect?.universal) {
          Linking.openURL(redirect.universal);
        } else {
          // TODO: Check Minimizer.goBack
          Alert.alert('Success', 'Please go back to the dapp');
        }
      });
    } else if (redirect?.universal) {
      Linking.openURL(redirect.universal);
    } else {
      Alert.alert('Success', 'Please go back to the dapp');
    }
  } catch (error) {
    console.log(error);
    Alert.alert('Error', 'An error ocurrer while redirecting to the dapp');
  }
};
