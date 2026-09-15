import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { Image } from "expo-image";
import { memo, useCallback, useEffect, useState } from "react";
import {
  Animated,
  Easing,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ThemedText } from "./themed-text";

const PIN_LENGTH = 4;

const FACE_ID_ICON = require("@/assets/images/face-id.png");
const TOUCH_ID_ICON = require("@/assets/images/touch-id.png");
const BACKSPACE_ICON = require("@/assets/images/backspace.png");

interface PinModalProps {
  visible: boolean;
  title: string;
  subtitle?: string;
  onComplete: (pin: string) => void;
  onCancel: () => void;
  error?: string | null;
  showBiometric?: boolean;
  onBiometricPress?: () => void;
  biometricType?: "facial" | "fingerprint" | "iris" | "none";
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
  biometricType,
}: PinModalProps) {
  const theme = useTheme();
  const [pin, setPin] = useState("");
  const [shakeAnimation] = useState(new Animated.Value(0));
  const [prevVisible, setPrevVisible] = useState(visible);
  const [prevError, setPrevError] = useState(error);

  // Clear the entered PIN when the modal is hidden or a new error arrives.
  // Adjusting state during render is the recommended React pattern for
  // resetting state in response to prop changes (avoids setState-in-effect).
  if (prevVisible !== visible) {
    setPrevVisible(visible);
    if (!visible) {
      setPin("");
    }
  }
  if (prevError !== error) {
    setPrevError(error);
    if (error) {
      setPin("");
    }
  }

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

  const content = (
    <View style={styles.overlay}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
      <View
        style={[styles.container, { backgroundColor: theme["bg-primary"] }]}
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
                  const isFaceLike =
                    biometricType === "facial" || biometricType === "iris";
                  return (
                    <TouchableOpacity
                      key={key}
                      onPress={onBiometricPress ?? (() => {})}
                      activeOpacity={0.7}
                      accessibilityRole="button"
                      accessibilityLabel={
                        isFaceLike ? "Face ID" : "Fingerprint"
                      }
                      style={[
                        styles.key,
                        { backgroundColor: theme["foreground-primary-fix"] },
                      ]}
                    >
                      <Image
                        source={isFaceLike ? FACE_ID_ICON : TOUCH_ID_ICON}
                        style={styles.biometricIcon}
                        tintColor={theme["text-primary"]}
                        contentFit="contain"
                      />
                    </TouchableOpacity>
                  );
                }

                return (
                  <TouchableOpacity
                    key={key}
                    onPress={() => handleKeyPress(key)}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={key === "erase" ? "Delete" : key}
                    style={[
                      styles.key,
                      { backgroundColor: theme["foreground-primary-fix"] },
                    ]}
                  >
                    {key === "erase" ? (
                      <Image
                        source={BACKSPACE_ICON}
                        style={styles.eraseIcon}
                        tintColor={theme["text-primary"]}
                        contentFit="contain"
                      />
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
            { borderColor: theme["border-secondary"], borderWidth: 1 },
          ]}
        >
          <ThemedText fontSize={18} lineHeight={20} color="text-primary">
            Cancel
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      {Platform.OS === "android" ? (
        <GestureHandlerRootView style={{ flex: 1 }}>
          {content}
        </GestureHandlerRootView>
      ) : (
        content
      )}
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
  biometricIcon: {
    width: 26,
    height: 26,
  },
  eraseIcon: {
    width: 22,
    height: 22,
  },
  cancelButton: {
    marginTop: Spacing["spacing-5"],
    paddingHorizontal: Spacing["spacing-6"],
    borderRadius: BorderRadius["3"],
    width: "100%",
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
});
