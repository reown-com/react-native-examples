import React from "react";
import { Modal, Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

interface FramedModalProps {
  visible: boolean;
  onRequestClose?: () => void;
  children: React.ReactNode;
}

/**
 * Native modal wrapper. On native platforms, uses React Native's Modal directly.
 * Wraps children in GestureHandlerRootView on Android since Modals create a
 * separate Window that needs its own gesture handler root.
 */
export function FramedModal({
  visible,
  onRequestClose,
  children,
}: FramedModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onRequestClose}
    >
      {Platform.OS === "android" ? (
        <GestureHandlerRootView style={{ flex: 1 }}>
          {children}
        </GestureHandlerRootView>
      ) : (
        children
      )}
    </Modal>
  );
}
