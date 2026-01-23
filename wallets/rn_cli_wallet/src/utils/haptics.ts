import Haptics from '@mhpdev/react-native-haptics';

export const haptics = {
  // Modal/request appearance - medium impact to alert user
  modalOpen: () => Haptics.impact('medium'),

  // Request accepted/rejected - light impact after walletKit response
  requestResponse: () => Haptics.impact('light'),

  // Copy address - light impact for clipboard feedback
  copyAddress: () => Haptics.impact('light'),

  // Pull to refresh - soft impact, subtle confirmation
  pullToRefresh: () => Haptics.impact('soft'),

  // QR scan success - selection feedback for scan confirmation
  scanSuccess: () => Haptics.selection(),

  // Payment/transaction outcomes
  success: () => Haptics.notification('success'),
  error: () => Haptics.notification('error'),
  warning: () => Haptics.notification('warning'),
};
