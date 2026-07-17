// Centralized toast access so call sites don't import the native lib
// directly — swap the implementation here if it ever changes again.
// The root <Toast> renderer still lives in App.tsx and the UI config in
// ToastConfig.tsx; those legitimately depend on the library directly.
import Toast from 'react-native-toast-message';

type ToastParams = Parameters<typeof Toast.show>[0];

export function showToast(params: ToastParams): void {
  Toast.show(params);
}
