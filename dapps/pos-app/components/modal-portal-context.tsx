import React, { createContext, useContext, RefObject } from "react";

interface ModalPortalContextValue {
  containerRef: RefObject<HTMLDivElement | null> | null;
}

export const ModalPortalContext = createContext<ModalPortalContextValue>({
  containerRef: null,
});

export function useModalPortal() {
  return useContext(ModalPortalContext);
}

interface ModalPortalProviderProps {
  containerRef: RefObject<HTMLDivElement | null>;
  children: React.ReactNode;
}

export function ModalPortalProvider({
  containerRef,
  children,
}: ModalPortalProviderProps) {
  return (
    <ModalPortalContext.Provider value={{ containerRef }}>
      {children}
    </ModalPortalContext.Provider>
  );
}
