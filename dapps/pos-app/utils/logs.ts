import { LogEntry } from "@/store/useLogsStore";

/**
 * Short timestamp for the log card header (day/month + time, no year).
 */
export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleString(undefined, {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

/**
 * Full timestamp (includes the year) used when copying/sharing a log entry.
 */
export const formatFullTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

/**
 * Serialize a log entry to a shareable JSON string (copied to the clipboard).
 */
export const buildLogText = (item: LogEntry): string => {
  const location = [item.view, item.functionName].filter(Boolean).join(":");
  const entry: Record<string, unknown> = {
    type: item.level,
    date: formatFullTimestamp(item.timestamp),
    ...(location ? { location } : {}),
    message: item.message,
    ...(item.data ? { body: item.data } : {}),
  };
  return JSON.stringify(entry, null, 2);
};
