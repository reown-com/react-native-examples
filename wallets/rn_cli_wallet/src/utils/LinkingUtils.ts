import {Linking} from 'react-native';
import Toast from 'react-native-toast-message';

interface redirect {
  native?: string;
  universal?: string;
  linkMode?: boolean;
}

export const handleRedirect = (
  peerRedirect?: redirect,
  selfRedirect?: redirect,
) => {
  try {
    if (peerRedirect?.linkMode && selfRedirect?.linkMode) {
      Toast.show({
        type: 'success',
        text1: 'Redirecting to the dapp...',
      });
      return;
    }

    if (peerRedirect?.native) {
      Linking.openURL(peerRedirect.native).catch(() => {
        // Fallback to universal link
        if (peerRedirect?.universal) {
          Linking.openURL(peerRedirect.universal);
        } else {
          Toast.show({
            type: 'success',
            text1: 'Go back to the dapp',
          });
        }
      });
    } else if (peerRedirect?.universal) {
      Linking.openURL(peerRedirect.universal);
    } else {
      Toast.show({
        type: 'success',
        text1: 'Go back to the dapp',
      });
    }
  } catch (error) {
    console.log(error);
    Toast.show({
      type: 'success',
      text1: 'Go back to the dapp',
    });
  }
};
