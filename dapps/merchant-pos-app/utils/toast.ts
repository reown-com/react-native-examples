import Toast from "react-native-toast-message";

export function showToast(message: string) {
  Toast.show({ type: "success", text1: message });
}

export function showErrorToast(message: string) {
  Toast.show({ type: "error", text1: message });
}
