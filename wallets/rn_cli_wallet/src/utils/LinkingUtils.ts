import Minimizer from 'react-native-minimizer';
import {Linking} from 'react-native';

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
          Minimizer.goBack();
        }
      });
    } else if (redirect?.universal) {
      Linking.openURL(redirect.universal);
    } else {
      Minimizer.goBack();
    }
  } catch (error) {
    console.log(error);
    Minimizer.goBack();
  }
};
