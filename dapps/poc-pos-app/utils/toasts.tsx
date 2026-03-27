import { Toast } from "@/components/toast";
import { BaseToastProps } from "react-native-toast-message";

export const toastConfig = {
  error: ({ text1 }: BaseToastProps) => <Toast message={text1} type="error" />,
  info: ({ text1 }: BaseToastProps) => <Toast message={text1} type="info" />,
};
