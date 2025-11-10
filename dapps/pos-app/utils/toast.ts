import Toast from "react-native-toast-message";

interface ToastProps {
  title?: string;
  message?: string;
  type: "success" | "error" | "info" | "warning";
}

type ToastPropsWithHaptics = Omit<ToastProps, "type"> & {
  haptics?: boolean;
};

export const showToast = ({ title, message, type }: ToastProps) => {
  Toast.show({
    type,
    text1: title,
    text2: message,
  });
};

export const hideToast = () => {
  Toast.hide();
};

export const showErrorToast = ({
  title,
  message,
  haptics = true,
}: ToastPropsWithHaptics) => {
  showToast({ title, message, type: "error" });
};

export const showSuccessToast = ({
  title,
  message,
  haptics = true,
}: ToastPropsWithHaptics) => {
  showToast({ title, message, type: "success" });
};

export const showInfoToast = ({
  title,
  message,
  haptics = true,
}: ToastPropsWithHaptics) => {
  showToast({ title, message, type: "info" });
};

export const showWarningToast = ({
  title,
  message,
  haptics = true,
}: ToastPropsWithHaptics) => {
  showToast({ title, message, type: "warning" });
};
