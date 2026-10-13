import Toast from "react-native-toast-message";

interface ToastProps {
  message?: string;
  type: "success" | "error" | "info" | "warning" | "loading";
  visibilityTime?: number;
  autoHide?: boolean;
}

export const showToast = ({
  message,
  type,
  visibilityTime,
  autoHide,
}: ToastProps) => {
  Toast.show({
    type,
    text1: message,
    ...(visibilityTime && { visibilityTime }),
    ...(autoHide !== undefined && { autoHide }),
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

export const showInfoToast = (message: string, visibilityTime?: number) => {
  showToast({ message, type: "info", visibilityTime });
};
