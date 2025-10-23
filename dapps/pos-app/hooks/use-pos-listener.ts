import POSClientService from "@/services/POSClientService";
import { POSClientTypes } from "@walletconnect/pos-client";
import { useEffect, useRef } from "react";

/**
 * Custom hook for managing POS client event listeners
 *
 * @param event - The event name to listen for
 * @param listener - The callback function to execute when the event is triggered
 * @param deps - Dependency array for the callback (similar to useEffect)
 *
 * @example
 * ```typescript
 * const MyComponent = () => {
 *   usePOSListener("payment_successful", (data) => {
 *     console.log("Payment successful:", data);
 *   });
 *
 *   usePOSListener("payment_failed", (data) => {
 *     console.log("Payment failed:", data);
 *   }, [someDependency]);
 * };
 * ```
 */
export const usePOSListener = <E extends POSClientTypes.Event>(
  event: E,
  listener: (args: POSClientTypes.EventArguments[E]) => void,
) => {
  const listenerRef = useRef(listener);

  // Update the ref whenever the listener changes
  useEffect(() => {
    listenerRef.current = listener;
  }, [listener]);

  useEffect(() => {
    const posService = POSClientService.getInstance();

    const stableListener = (args: POSClientTypes.EventArguments[E]) => {
      listenerRef.current(args);
    };

    posService.addListener(event, stableListener);

    return () => {
      posService.removeListener(event, stableListener);
    };
  }, [event]);
};
