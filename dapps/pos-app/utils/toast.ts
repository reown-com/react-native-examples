import Toast from "react-native-toast-message";

interface ToastProps {
  message?: string;
  type: "success" | "error" | "info" | "warning";
}

export const showToast = ({ message, type }: ToastProps) => {
  Toast.show({
    type,
    text1: message,
  });
};

export const hideToast = () => {
  Toast.hide();
};

export const showErrorToast = (message: string) => {
  showToast({ message, type: "error" });
};

export const showSuccessToast = (message: string) => {
  showToast({ message, type: "success" });
};

export const showInfoToast = (message: string) => {
  showToast({ message, type: "info" });
};
