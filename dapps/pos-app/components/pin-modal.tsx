import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { memo, useCallback, useEffect, useState } from "react";
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedText } from "./themed-text";

const PIN_LENGTH = 4;

interface PinModalProps {
  visible: boolean;
  title: string;
  subtitle?: string;
  onComplete: (pin: string) => void;
  onCancel: () => void;
  error?: string | null;
  showBiometric?: boolean;
  onBiometricPress?: () => void;
}

function PinModalBase({
  visible,
  title,
  subtitle,
  onComplete,
  onCancel,
  error,
  showBiometric,
  onBiometricPress,
}: PinModalProps) {
  const theme = useTheme();
  const [pin, setPin] = useState("");
  const [shakeAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    if (!visible) {
      setPin("");
    }
  }, [visible]);

  useEffect(() => {
    if (error) {
      // Shake animation on error
      Animated.sequence([
        Animated.timing(shakeAnimation, {
          toValue: 10,
          duration: 50,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: -10,
          duration: 50,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: 10,
          duration: 50,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: 0,
          duration: 50,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]).start();
      setPin("");
    }
  }, [error, shakeAnimation]);

  const handleKeyPress = useCallback(
    (key: string) => {
      if (key === "erase") {
        setPin((prev) => prev.slice(0, -1));
      } else if (pin.length < PIN_LENGTH) {
        const newPin = pin + key;
        setPin(newPin);
        if (newPin.length === PIN_LENGTH) {
          onComplete(newPin);
        }
      }
    },
    [pin, onComplete],
  );

  const keys = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    [showBiometric ? "biometric" : "", "0", "erase"],
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable
          style={[styles.container, { backgroundColor: theme["bg-primary"] }]}
          onPress={(e) => e.stopPropagation()}
        >
          <ThemedText
            fontSize={20}
            lineHeight={24}
            color="text-primary"
            style={styles.title}
          >
            {title}
          </ThemedText>

          {subtitle && (
            <ThemedText
              fontSize={14}
              lineHeight={18}
              color="text-secondary"
              style={styles.subtitle}
            >
              {subtitle}
            </ThemedText>
          )}

          <Animated.View
            style={[
              styles.dotsContainer,
              { transform: [{ translateX: shakeAnimation }] },
            ]}
          >
            {Array.from({ length: PIN_LENGTH }).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      index < pin.length
                        ? error
                          ? theme["icon-error"]
                          : theme["bg-accent-primary"]
                        : theme["foreground-tertiary"],
                  },
                ]}
              />
            ))}
          </Animated.View>

          {error && (
            <ThemedText
              fontSize={12}
              lineHeight={14}
              style={[styles.errorText, { color: theme["icon-error"] }]}
            >
              {error}
            </ThemedText>
          )}

          <View style={styles.keyboard}>
            {keys.map((row, rowIndex) => (
              <View key={`row-${rowIndex}`} style={styles.row}>
                {row.map((key) => {
                  if (key === "") {
                    return <View key="empty" style={styles.key} />;
                  }

                  if (key === "biometric") {
                    return (
                      <TouchableOpacity
                        key={key}
                        onPress={onBiometricPress ?? (() => {})}
                        activeOpacity={0.7}
                        style={[
                          styles.key,
                          { backgroundColor: theme["foreground-primary"] },
                        ]}
                      >
                        <ThemedText fontSize={16}>🔐</ThemedText>
                      </TouchableOpacity>
                    );
                  }

                  return (
                    <TouchableOpacity
                      key={key}
                      onPress={() => handleKeyPress(key)}
                      activeOpacity={0.7}
                      style={[
                        styles.key,
                        { backgroundColor: theme["foreground-primary"] },
                      ]}
                    >
                      {key === "erase" ? (
                        <ThemedText
                          style={[
                            styles.keyText,
                            { color: theme["text-primary"] },
                          ]}
                        >
                          ⌫
                        </ThemedText>
                      ) : (
                        <ThemedText
                          style={[
                            styles.keyText,
                            { color: theme["text-primary"] },
                          ]}
                        >
                          {key}
                        </ThemedText>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>

          <TouchableOpacity
            onPress={onCancel}
            activeOpacity={0.7}
            style={[
              styles.cancelButton,
              { backgroundColor: theme["foreground-secondary"] },
            ]}
          >
            <ThemedText fontSize={16} lineHeight={18} color="text-primary">
              Cancel
            </ThemedText>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export const PinModal = memo(PinModalBase);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "85%",
    maxWidth: 340,
    borderRadius: BorderRadius["5"],
    padding: Spacing["spacing-6"],
    alignItems: "center",
  },
  title: {
    fontWeight: "600",
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    marginTop: Spacing["spacing-2"],
  },
  dotsContainer: {
    flexDirection: "row",
    gap: Spacing["spacing-4"],
    marginTop: Spacing["spacing-6"],
    marginBottom: Spacing["spacing-4"],
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  errorText: {
    marginBottom: Spacing["spacing-2"],
  },
  keyboard: {
    width: "100%",
    gap: Spacing["spacing-2"],
    marginTop: Spacing["spacing-4"],
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: Spacing["spacing-2"],
  },
  key: {
    flex: 1,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: BorderRadius["3"],
  },
  keyText: {
    fontSize: 22,
    lineHeight: 26,
  },
  cancelButton: {
    marginTop: Spacing["spacing-5"],
    paddingVertical: Spacing["spacing-3"],
    paddingHorizontal: Spacing["spacing-6"],
    borderRadius: BorderRadius["3"],
    width: "100%",
    alignItems: "center",
  },
});
