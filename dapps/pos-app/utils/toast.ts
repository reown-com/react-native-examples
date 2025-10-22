import Toast from 'react-native-toast-message';

interface ToastProps {
  title?: string;
  message?: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export const showToast = ({title, message, type}: ToastProps) => {
  Toast.show({
    type,
    text1: title,
    text2: message,
  });
};

export const hideToast = () => {
  Toast.hide();
};

export const showErrorToast = (title?: string, message?: string) => {
  showToast({title, message, type: 'error'});
};

export const showSuccessToast = (title?: string, message?: string) => {
  showToast({title, message, type: 'success'});
};

export const showInfoToast = (title?: string, message?: string) => {
  showToast({title, message, type: 'info'});
};

export const showWarningToast = (title?: string, message?: string) => {
  showToast({title, message, type: 'warning'});
};