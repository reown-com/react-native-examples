import { getUniqueId } from "react-native-device-info";

export const getDate = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getDeviceIdentifier = async () => {
  try {
    const deviceId = await getUniqueId();
    return deviceId.toString();
  } catch {
    return "unknown";
  }
};

/**
 * Format date to short display string (e.g., "Oct 14, 25")
 */
export function formatShortDate(dateString?: string): string {
  if (!dateString) return "-";

  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "2-digit",
  });
}

/**
 * Format date with time (e.g., "Oct 14, 25 - 14:23")
 */
export function formatDateTime(dateString?: string): string {
  if (!dateString) return "-";

  const date = new Date(dateString);
  const datePart = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "2-digit",
  });
  const timePart = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${datePart} - ${timePart}`;
}

/**
 * Formats a number of seconds into "M:SSs" display format.
 * Examples: 312 -> "5:12s", 65 -> "1:05s", 9 -> "0:09s"
 */
export function formatCountdown(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(clamped / 60);
  const seconds = clamped % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}s`;
}
