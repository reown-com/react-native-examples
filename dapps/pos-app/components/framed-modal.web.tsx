import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { StyleSheet, View } from "react-native";

import { useModalPortal } from "./modal-portal-context";

interface FramedModalProps {
  visible: boolean;
  onRequestClose?: () => void;
  children: React.ReactNode;
}

/**
 * Web-specific modal that renders inside the desktop frame container
 * instead of at the viewport level. Falls back to viewport positioning
 * if no portal container is available (mobile web).
 */
export function FramedModal({
  visible,
  onRequestClose,
  children,
}: FramedModalProps) {
  const { containerRef } = useModalPortal();

  // Handle escape key
  useEffect(() => {
    if (!visible || !onRequestClose) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onRequestClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [visible, onRequestClose]);

  if (!visible) return null;

  const modalContent = <View style={styles.container}>{children}</View>;

  // If we have a container ref (desktop web), use portal
  if (containerRef?.current) {
    return createPortal(modalContent, containerRef.current);
  }

  // Fallback: render in place (mobile web)
  return modalContent;
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
});
