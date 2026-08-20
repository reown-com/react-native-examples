import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { Image } from "expo-image";
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

interface ClearLogsModalProps {
  visible: boolean;
  count: number;
  onConfirm: () => void;
  onClose: () => void;
}

function ClearLogsModalBase({
  visible,
  count,
  onConfirm,
  onClose,
}: ClearLogsModalProps) {
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
                style={styles.trashIcon}
                tintColor={theme["icon-accent-primary"]}
                source={require("@/assets/images/trash.png")}
              />
              <ThemedText
                fontSize={20}
                lineHeight={24}
                color="text-primary"
                style={styles.title}
              >
                {`You're about to clear ${count} log ${
                  count === 1 ? "entry" : "entries"
                }`}
              </ThemedText>
              <ThemedText
                fontSize={16}
                lineHeight={20}
                color="text-secondary"
                style={styles.description}
              >
                {
                  "This can't be undone. We don't keep a copy, so copy them first if support needs them."
                }
              </ThemedText>
            </View>

            <View style={styles.actions}>
              <Button type="accent" variant="primary" onPress={onConfirm}>
                Clear logs
              </Button>
              <Button type="neutral" variant="secondary" onPress={onClose}>
                Cancel
              </Button>
            </View>
          </View>
        </Animated.View>
      </View>
    </FramedModal>
  );
}

export const ClearLogsModal = memo(ClearLogsModalBase);

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
  trashIcon: {
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
