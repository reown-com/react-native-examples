import { Toast } from "@/components/toast";
import { BaseToastProps } from "react-native-toast-message";

export const toastConfig = {
  error: ({ text1 }: BaseToastProps) => <Toast message={text1} type="error" />,
  info: ({ text1 }: BaseToastProps) => <Toast message={text1} type="info" />,
  success: ({ text1 }: BaseToastProps) => (
    <Toast message={text1} type="success" />
  ),
  warning: ({ text1 }: BaseToastProps) => (
    <Toast message={text1} type="warning" />
  ),
  loading: ({ text1 }: BaseToastProps) => (
    <Toast message={text1} type="loading" />
  ),
};
