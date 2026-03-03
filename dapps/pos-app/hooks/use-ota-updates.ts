import * as Updates from "expo-updates";
import * as Sentry from "@sentry/react-native";
import { useCallback, useEffect, useRef } from "react";
import { AppState, type AppStateStatus, Platform } from "react-native";
import { useLogsStore } from "@/store/useLogsStore";

const CHECK_INTERVAL_MS = 5 * 60 * 1000; // Minimum 5 min between checks

export function useOTAUpdates() {
  const lastCheckRef = useRef<number>(0);
  const addLog = useLogsStore((state) => state.addLog);

  const checkForUpdate = useCallback(async () => {
    if (__DEV__ || Platform.OS === "web") return;

    const now = Date.now();
    if (now - lastCheckRef.current < CHECK_INTERVAL_MS) return;
    lastCheckRef.current = now;

    try {
      const checkResult = await Updates.checkForUpdateAsync();

      if (!checkResult.isAvailable) return;

      addLog(
        "info",
        "OTA update available, downloading...",
        "OTAUpdates",
        "checkForUpdate",
      );

      const fetchResult = await Updates.fetchUpdateAsync();

      if (fetchResult.isNew) {
        addLog(
          "info",
          "OTA update downloaded, reloading app",
          "OTAUpdates",
          "checkForUpdate",
        );
        await Updates.reloadAsync();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      addLog(
        "error",
        `OTA update failed: ${message}`,
        "OTAUpdates",
        "checkForUpdate",
      );
      Sentry.captureException(error, {
        tags: { component: "ota-updates" },
      });
    }
  }, [addLog]);

  useEffect(() => {
    checkForUpdate();

    const subscription = AppState.addEventListener(
      "change",
      (nextState: AppStateStatus) => {
        if (nextState === "active") {
          checkForUpdate();
        }
      },
    );

    return () => subscription.remove();
  }, [checkForUpdate]);
}
