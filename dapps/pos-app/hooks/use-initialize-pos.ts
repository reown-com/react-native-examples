import POSClientService, { POSClientConfig } from "@/services/POSClientService";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { IPOSClient } from "@walletconnect/pos-client";
import { useEffect, useState } from "react";

export const useInitializePOS = ({
  deviceId,
  projectId,
  metadata,
  loggerOptions,
}: POSClientConfig) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [posClient, setPosClient] = useState<IPOSClient | null>(null);

  const posService = POSClientService.getInstance();

  useEffect(() => {
    posService
      .initialize({
        projectId,
        metadata,
        deviceId,
        loggerOptions,
      })
      .then(() => {
        setIsInitialized(true);
        setPosClient(posService.getClient());
        showSuccessToast({ title: "POS terminal initialized" });
      })
      .catch((error) => {
        console.error("Error initializing POS client:", error);
        showErrorToast({ title: "Failed to initialize POS terminal" });
      });
  }, [deviceId, projectId, metadata, posService, loggerOptions]);

  return {
    isInitialized,
    posClient,
  };
};
