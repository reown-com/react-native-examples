import Toast from 'react-native-toast-message';

export const ToastUtils = {
  showSuccessToast: (title: string, message?: string) => {
    Toast.show({
      type: 'success',
      text1: title,
      text2: message,
    });
  },
  showErrorToast: (title: string, message?: string) => {
    Toast.show({
      type: 'error',
      text1: title,
      text2: message,
    });
  },
  showInfoToast: (title: string, message?: string) => {
    Toast.show({
      type: 'info',
      text1: title,
      text2: message,
    });
  },
};
