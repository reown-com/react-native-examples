// Centralized clipboard access so call sites don't import the native lib
// directly — swap the implementation here if it ever changes again.
import * as Clipboard from 'expo-clipboard';

export function setClipboardString(value: string): Promise<boolean> {
  return Clipboard.setStringAsync(value);
}

export function getClipboardString(): Promise<string> {
  return Clipboard.getStringAsync();
}
