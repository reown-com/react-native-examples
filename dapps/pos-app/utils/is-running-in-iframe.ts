import { Platform } from "react-native";

/**
 * Returns true when the web POS is running inside an iframe.
 * Always returns false on native platforms.
 */
export function isRunningInIframe(): boolean {
  if (Platform.OS !== "web" || typeof window === "undefined") return false;
  try {
    return window.self !== window.top;
  } catch {
    // Cross-origin access means the POS is running in an iframe.
    return true;
  }
}
