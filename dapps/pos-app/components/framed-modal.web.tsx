import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { StyleSheet } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { useModalPortal } from "./modal-portal-context";

const ANIMATION_DURATION = 200;
const EASING = Easing.inOut(Easing.ease);

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
  const [isRendered, setIsRendered] = useState(false);
  const progress = useSharedValue(0);
  const visibleRef = useRef(visible);

  visibleRef.current = visible;

  const handleCloseComplete = useCallback(() => {
    if (!visibleRef.current) {
      setIsRendered(false);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      setIsRendered(true);
      requestAnimationFrame(() => {
        progress.value = withTiming(1, {
          duration: ANIMATION_DURATION,
          easing: EASING,
        });
      });
    } else if (isRendered) {
      progress.value = withTiming(
        0,
        { duration: ANIMATION_DURATION, easing: EASING },
        (finished) => {
          if (finished) {
            runOnJS(handleCloseComplete)();
          }
        },
      );
    }
  }, [visible, isRendered, progress, handleCloseComplete]);

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

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  if (!isRendered) return null;

  const modalContent = (
    <Animated.View style={[styles.container, containerAnimatedStyle]}>
      {children}
    </Animated.View>
  );

  // If we have a container ref (desktop web), use portal
  if (containerRef?.current) {
    return createPortal(modalContent, containerRef.current);
  }

  // Fallback: render at viewport level (mobile web)
  return createPortal(modalContent, document.body);
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
