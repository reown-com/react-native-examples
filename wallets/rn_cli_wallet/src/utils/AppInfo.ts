// Centralized app metadata access so call sites don't import the native lib
// directly — swap the implementation here if it ever changes again.
import * as Application from 'expo-application';

export function getBundleId(): string {
  return Application.applicationId ?? '';
}

export function getVersion(): string {
  return Application.nativeApplicationVersion ?? '';
}

export function getBuildNumber(): string {
  return Application.nativeBuildVersion ?? '';
}
