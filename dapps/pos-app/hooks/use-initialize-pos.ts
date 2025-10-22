import POSClientService, { POSClientConfig } from "@/services/POSClientService";
import { IPOSClient } from "@walletconnect/pos-client";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

export type PaymentState =
  | "idle"
  | "connecting"
  | "payment_requesting"
  | "payment_processing"
  | "payment_completed"
  | "payment_failed";

export const useInitializePOS = ({deviceId, projectId, metadata, loggerOptions}: POSClientConfig) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [posClient, setPosClient] = useState<IPOSClient | null>(null);
  
  const posService = POSClientService.getInstance();
  
  useEffect(() => {
    posService.initialize({
      projectId,
      metadata,
      deviceId,
      loggerOptions
    })
      .then(() => {
        setIsInitialized(true);
        setPosClient(posService.getClient());
      })
      .catch((error) => {
        console.error("Error initializing POS client:", error);
        Alert.alert("Failed to initialize POS terminal", "🔴");
      });
  }, [deviceId, projectId, metadata, posService, loggerOptions]);

  return {
    isInitialized,
    posClient,
  }
};