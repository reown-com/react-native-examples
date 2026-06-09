import { Platform } from "react-native";

/**
 * Returns true when the web app is running inside an iframe.
 * Always returns false on native platforms.
 */
export function isEmbedded(): boolean {
  if (Platform.OS !== "web") return false;
  try {
    return window.self !== window.top;
  } catch {
    // Cross-origin iframes throw on window.top access — that means we're embedded
    return true;
  }
}
