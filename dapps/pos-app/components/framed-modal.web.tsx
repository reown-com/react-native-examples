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

interface BodyLockSnapshot {
  scrollY: number;
  bodyPosition: string;
  bodyTop: string;
  bodyLeft: string;
  bodyRight: string;
  bodyWidth: string;
  bodyOverflow: string;
  htmlOverflow: string;
}

let activeBodyLocks = 0;
let bodyLockSnapshot: BodyLockSnapshot | null = null;

function lockBodyScroll() {
  if (activeBodyLocks === 0) {
    const { body, documentElement } = document;
    const scrollY = window.scrollY;

    bodyLockSnapshot = {
      scrollY,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyLeft: body.style.left,
      bodyRight: body.style.right,
      bodyWidth: body.style.width,
      bodyOverflow: body.style.overflow,
      htmlOverflow: documentElement.style.overflow,
    };

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";
    documentElement.style.overflow = "hidden";
  }

  activeBodyLocks += 1;
}

function unlockBodyScroll() {
  if (activeBodyLocks === 0) return;

  activeBodyLocks -= 1;
  if (activeBodyLocks !== 0 || !bodyLockSnapshot) return;

  const { body, documentElement } = document;
  const {
    scrollY,
    bodyPosition,
    bodyTop,
    bodyLeft,
    bodyRight,
    bodyWidth,
    bodyOverflow,
    htmlOverflow,
  } = bodyLockSnapshot;

  body.style.position = bodyPosition;
  body.style.top = bodyTop;
  body.style.left = bodyLeft;
  body.style.right = bodyRight;
  body.style.width = bodyWidth;
  body.style.overflow = bodyOverflow;
  documentElement.style.overflow = htmlOverflow;
  window.scrollTo(0, scrollY);
  bodyLockSnapshot = null;
}

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
  const frameContainer = containerRef?.current ?? null;
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

  // Mobile web fallback renders into document.body. Lock page scroll while the
  // modal is open so iOS Safari keyboard focus doesn't permanently shift
  // underlying screen content.
  useEffect(() => {
    if (!visible || frameContainer) return;

    lockBodyScroll();
    return () => {
      unlockBodyScroll();
    };
  }, [visible, frameContainer]);

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

  // If we have a container ref (desktop web), use portal into the frame
  if (frameContainer) {
    const modalContent = (
      <Animated.View style={[styles.container, containerAnimatedStyle]}>
        {children}
      </Animated.View>
    );
    return createPortal(modalContent, frameContainer);
  }

  const modalContent = (
    <Animated.View style={[mobileWebContainer, containerAnimatedStyle]}>
      {children}
    </Animated.View>
  );

  return createPortal(modalContent, document.body);
}

// Plain object to use 'fixed' positioning (supported by RN Web but not in RN types)
const mobileWebContainer: Record<string, unknown> = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 1000,
};

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
