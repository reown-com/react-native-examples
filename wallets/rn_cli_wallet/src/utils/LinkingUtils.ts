import {Linking} from 'react-native';
import Toast from 'react-native-toast-message';

interface redirect {
  native?: string;
  universal?: string;
  linkMode?: boolean;
}

interface Props {
  peerRedirect?: redirect;
  isLinkMode?: boolean;
}

const showSuccessToast = () => {
    Toast.show({
      type: 'success',
      text1: 'Success!',
      text2: 'Please go back to the dapp',
    });
};

export const handleRedirect = ({peerRedirect, isLinkMode}: Props) => {
  try {
    if (isLinkMode) {
      Toast.show({
        type: 'success',
        text1: 'Success!',
        text2: 'Redirecting to the dapp',
      });
      return;
    }

    if (peerRedirect?.native) {
      Linking.openURL(peerRedirect.native).catch(() => {
        // Fallback to universal link
        if (peerRedirect?.universal) {
          Linking.openURL(peerRedirect.universal);
        } else {
          showSuccessToast();
        }
      });
    } else if (peerRedirect?.universal) {
      Linking.openURL(peerRedirect.universal);
    } else {
      showSuccessToast();
    }
  } catch {
    showSuccessToast();
  }
};
