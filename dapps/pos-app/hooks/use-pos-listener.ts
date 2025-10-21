import POSClientService from "@/services/POSClientService";
import { useEffect } from "react";

/**
 * Custom hook for managing POS client event listeners
 * 
 * @param event - The event name to listen for
 * @param callback - The callback function to execute when the event is triggered
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
export const usePOSListener = (event: string, callback: (args: any) => void, deps: any[] = []) => {
  useEffect(() => {
    const posService = POSClientService.getInstance();
    posService.addListener(event, callback);
    
    return () => {
      posService.removeListener(event, callback);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, callback, ...deps]);
};
