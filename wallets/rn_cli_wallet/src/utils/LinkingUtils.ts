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
          //Show success toast
        }
      });
    } else if (redirect?.universal) {
      Linking.openURL(redirect.universal);
    } else {
      //Show success toast
    }
  } catch (error) {
    console.log(error);
    //Show success toast
  }
};
