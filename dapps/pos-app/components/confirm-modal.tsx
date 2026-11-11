import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { Image, ImageSource } from "expo-image";
import { memo, useEffect } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "./button";
import { FramedModal } from "./framed-modal";
import { Pressable as ScalePressable } from "./pressable";
import { ThemedText } from "./themed-text";

const ANIMATION_DURATION = 200;
const EASING = Easing.inOut(Easing.ease);

export interface ConfirmModalProps {
  visible: boolean;
  icon: ImageSource;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
  testID?: string;
}

/**
 * Bottom-sheet confirmation: icon, title, description, a primary action and a
 * secondary cancel. Closing (X, backdrop, back) counts as cancel.
 */
function ConfirmModalBase({
  visible,
  icon,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  onConfirm,
  onClose,
  testID,
}: ConfirmModalProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const translateY = useSharedValue(Platform.OS === "web" ? 300 : 0);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    translateY.value = withTiming(visible ? 0 : 300, {
      duration: ANIMATION_DURATION,
      easing: EASING,
    });
  }, [visible, translateY]);

  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <FramedModal visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View
          style={[
            styles.container,
            { backgroundColor: theme["bg-primary"] },
            sheetAnimatedStyle,
          ]}
        >
          <View
            style={[
              styles.containerInner,
              {
                paddingBottom: Math.max(insets.bottom, Spacing["spacing-6"]),
              },
            ]}
          >
            <View style={styles.header}>
              <ScalePressable
                onPress={onClose}
                accessibilityLabel="Close"
                style={[
                  styles.closeButton,
                  { borderColor: theme["border-secondary"] },
                ]}
              >
                <Image
                  style={styles.closeIcon}
                  tintColor={theme["icon-invert"]}
                  source={require("@/assets/images/close.png")}
                />
              </ScalePressable>
            </View>

            <View style={styles.body}>
              <Image
                style={styles.icon}
                tintColor={theme["icon-accent-primary"]}
                source={icon}
              />
              <ThemedText
                fontSize={20}
                lineHeight={24}
                color="text-primary"
                style={styles.title}
              >
                {title}
              </ThemedText>
              <ThemedText
                fontSize={16}
                lineHeight={20}
                color="text-secondary"
                style={styles.description}
              >
                {description}
              </ThemedText>
            </View>

            <View style={styles.actions}>
              <Button
                type="accent"
                variant="primary"
                onPress={onConfirm}
                testID={testID ? `${testID}-confirm` : undefined}
              >
                {confirmLabel}
              </Button>
              <Button
                type="neutral"
                variant="secondary"
                onPress={onClose}
                testID={testID ? `${testID}-cancel` : undefined}
              >
                {cancelLabel}
              </Button>
            </View>
          </View>
        </Animated.View>
      </View>
    </FramedModal>
  );
}

export const ConfirmModal = memo(ConfirmModalBase);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  container: {
    borderTopLeftRadius: BorderRadius["8"],
    borderTopRightRadius: BorderRadius["8"],
  },
  containerInner: {
    paddingTop: Spacing["spacing-4"],
    paddingHorizontal: Spacing["spacing-5"],
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  closeButton: {
    borderRadius: BorderRadius["3"],
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing["spacing-3"],
  },
  closeIcon: {
    width: 20,
    height: 20,
  },
  body: {
    alignItems: "center",
    paddingHorizontal: Spacing["spacing-4"],
    marginTop: Spacing["spacing-2"],
    marginBottom: Spacing["spacing-7"],
  },
  icon: {
    width: 40,
    height: 40,
    marginBottom: Spacing["spacing-3"],
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing["spacing-2"],
  },
  description: {
    textAlign: "center",
  },
  actions: {
    gap: Spacing["spacing-3"],
  },
});
