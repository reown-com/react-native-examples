// Web variant of haptics — @mhpdev/react-native-haptics is native-only
// (registers a TurboModule that doesn't exist on web). Haptics are
// non-critical, so every method is a no-op on web.
const noop = () => {};

export const haptics = {
  modalOpen: noop,
  requestResponse: noop,
  copyAddress: noop,
  pullToRefresh: noop,
  scanSuccess: noop,
  success: noop,
  error: noop,
  warning: noop,
  tabChange: noop,
};
