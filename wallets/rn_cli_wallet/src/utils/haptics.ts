import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

const { AndroidHaptics, ImpactFeedbackStyle, NotificationFeedbackType } =
  Haptics;

type HapticCall = () => Promise<void>;

const safeHaptic = (fn: HapticCall) => {
  // Fail silently - haptics are non-critical
  fn().catch(() => {});
};

// On Android, impact/notification/selection go through the Vibrator service,
// which feels buzzy. performAndroidHapticsAsync uses the system haptics engine
// (View.performHapticFeedback), respects the user's touch-feedback setting, and
// needs no VIBRATE permission. Some constants (Confirm/Reject) are API 30+, so
// fall back to the cross-platform call if the Android one rejects.
const haptic = (
  android: Haptics.AndroidHaptics,
  fallback: HapticCall,
): (() => void) =>
  Platform.OS === 'android'
    ? () =>
        safeHaptic(() =>
          Haptics.performAndroidHapticsAsync(android).catch(fallback),
        )
    : () => safeHaptic(fallback);

export const haptics = {
  modalOpen: haptic(AndroidHaptics.Virtual_Key, () =>
    Haptics.impactAsync(ImpactFeedbackStyle.Medium),
  ),
  requestResponse: haptic(AndroidHaptics.Keyboard_Tap, () =>
    Haptics.impactAsync(ImpactFeedbackStyle.Light),
  ),
  copyAddress: haptic(AndroidHaptics.Keyboard_Tap, () =>
    Haptics.impactAsync(ImpactFeedbackStyle.Light),
  ),
  pullToRefresh: haptic(AndroidHaptics.Context_Click, () =>
    Haptics.impactAsync(ImpactFeedbackStyle.Soft),
  ),
  scanSuccess: haptic(AndroidHaptics.Clock_Tick, Haptics.selectionAsync),
  success: haptic(AndroidHaptics.Confirm, () =>
    Haptics.notificationAsync(NotificationFeedbackType.Success),
  ),
  error: haptic(AndroidHaptics.Reject, () =>
    Haptics.notificationAsync(NotificationFeedbackType.Error),
  ),
  warning: haptic(AndroidHaptics.Long_Press, () =>
    Haptics.notificationAsync(NotificationFeedbackType.Warning),
  ),
  tabChange: haptic(AndroidHaptics.Clock_Tick, Haptics.selectionAsync),
};
