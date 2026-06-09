import { useEffect, useRef, useState } from "react";

interface UseCountdownOptions {
  /** Epoch timestamp (seconds) when the countdown expires. Null means no countdown. */
  expiresAt: number | null;
  /** Callback invoked exactly once when the countdown reaches zero. */
  onExpired?: () => void;
}

interface UseCountdownResult {
  /** Remaining seconds (floored). 0 when expired or no expiresAt. */
  remainingSeconds: number;
  /** Whether the countdown has reached zero. */
  isExpired: boolean;
  /** Whether a countdown is active (expiresAt is set and not yet expired). */
  isActive: boolean;
}

function calculateRemaining(expiresAt: number | null): number {
  if (expiresAt === null) return 0;
  return Math.max(0, Math.floor(expiresAt - Date.now() / 1000));
}

export function useCountdown({
  expiresAt,
  onExpired,
}: UseCountdownOptions): UseCountdownResult {
  const hasCalledExpired = useRef(false);
  const onExpiredRef = useRef(onExpired);

  useEffect(() => {
    onExpiredRef.current = onExpired;
  }, [onExpired]);

  const [remainingSeconds, setRemainingSeconds] = useState(() =>
    calculateRemaining(expiresAt),
  );

  // Reset when expiresAt changes
  useEffect(() => {
    hasCalledExpired.current = false;
    setRemainingSeconds(calculateRemaining(expiresAt));
  }, [expiresAt]);

  useEffect(() => {
    if (expiresAt === null) return;

    const interval = setInterval(() => {
      const remaining = calculateRemaining(expiresAt);
      setRemainingSeconds(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        if (!hasCalledExpired.current && onExpiredRef.current) {
          hasCalledExpired.current = true;
          onExpiredRef.current();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const isExpired = expiresAt !== null && remainingSeconds <= 0;
  const isActive = expiresAt !== null && remainingSeconds > 0;

  return { remainingSeconds, isExpired, isActive };
}
