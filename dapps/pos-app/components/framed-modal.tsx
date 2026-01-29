import React from "react";
import { Modal } from "react-native";

interface FramedModalProps {
  visible: boolean;
  onRequestClose?: () => void;
  children: React.ReactNode;
}

/**
 * Native modal wrapper. On native platforms, uses React Native's Modal directly.
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
      onRequestClose={onRequestClose}
    >
      {children}
    </Modal>
  );
}
