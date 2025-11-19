import type { IPOSClient } from "@walletconnect/pos-client";
import { createContext, useContext } from "react";

export const POSContext = createContext<{
  posClient: IPOSClient | null;
  isInitialized: boolean;
}>({
  posClient: null,
  isInitialized: false,
});

export const POSProvider = ({
  posClient,
  isInitialized,
  children,
}: {
  posClient: IPOSClient | null;
  isInitialized: boolean;
  children: React.ReactNode;
}) => {
  return (
    <POSContext.Provider value={{ posClient, isInitialized }}>
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = () => {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error("usePOS must be used within a POSProvider");
  }
  return context;
};
