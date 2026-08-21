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
 * Format a date with time (e.g., "14 Oct 2025 - 14:45").
 * Accepts an ISO string or an epoch-ms timestamp.
 */
export function formatDateTime(input?: string | number): string {
  if (input === undefined || input === null || input === "") return "-";

  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "-";

  const datePart = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const timePart = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${datePart} - ${timePart}`;
}

/**
 * Formats a number of seconds into "M:SS" display format (colon notation, no
 * suffix). Examples: 312 -> "5:12", 65 -> "1:05", 45 -> "0:45", 9 -> "0:09"
 */
export function formatCountdown(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(clamped / 60);
  const seconds = clamped % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/**
 * Formats a number of seconds into a screen-reader-friendly phrase, spelled out
 * so assistive tech doesn't read "5:12" as "five colon twelve".
 * Examples: 312 -> "5 minutes 12 seconds", 65 -> "1 minute 5 seconds",
 * 60 -> "1 minute", 45 -> "45 seconds", 1 -> "1 second", 0 -> "0 seconds".
 */
export function formatCountdownSpoken(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(clamped / 60);
  const seconds = clamped % 60;
  const parts: string[] = [];
  if (minutes > 0) {
    parts.push(`${minutes} minute${minutes === 1 ? "" : "s"}`);
  }
  if (seconds > 0 || minutes === 0) {
    parts.push(`${seconds} second${seconds === 1 ? "" : "s"}`);
  }
  return parts.join(" ");
}
