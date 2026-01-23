import Haptics from '@mhpdev/react-native-haptics';

const safeHaptic = (fn: () => void) => {
  try {
    fn();
  } catch {
    // Fail silently - haptics are non-critical
  }
};

export const haptics = {
  modalOpen: () => safeHaptic(() => Haptics.impact('medium')),
  requestResponse: () => safeHaptic(() => Haptics.impact('light')),
  copyAddress: () => safeHaptic(() => Haptics.impact('light')),
  pullToRefresh: () => safeHaptic(() => Haptics.impact('soft')),
  scanSuccess: () => safeHaptic(() => Haptics.selection()),
  success: () => safeHaptic(() => Haptics.notification('success')),
  error: () => safeHaptic(() => Haptics.notification('error')),
  warning: () => safeHaptic(() => Haptics.notification('warning')),
};
