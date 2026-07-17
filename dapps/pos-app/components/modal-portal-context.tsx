import React, { createContext, useContext } from "react";

interface ModalPortalContextValue {
  container: HTMLDivElement | null;
}

export const ModalPortalContext = createContext<ModalPortalContextValue>({
  container: null,
});

export function useModalPortal() {
  return useContext(ModalPortalContext);
}

interface ModalPortalProviderProps {
  container: HTMLDivElement | null;
  children: React.ReactNode;
}

export function ModalPortalProvider({
  container,
  children,
}: ModalPortalProviderProps) {
  return (
    <ModalPortalContext.Provider value={{ container }}>
      {children}
    </ModalPortalContext.Provider>
  );
}
