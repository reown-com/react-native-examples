import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { Image } from "expo-image";
import React, { useEffect } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Button } from "./button";
import { FramedModal } from "./framed-modal";
import { ThemedText } from "./themed-text";

const ANIMATION_DURATION = 200;
const EASING = Easing.inOut(Easing.ease);

interface SettingsBottomSheetProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function SettingsBottomSheet({
  visible,
  title,
  onClose,
  children,
}: SettingsBottomSheetProps) {
  const Theme = useTheme();

  const translateY = useSharedValue(Platform.OS === "web" ? 300 : 0);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    if (visible) {
      translateY.value = withTiming(0, {
        duration: ANIMATION_DURATION,
        easing: EASING,
      });
    } else {
      translateY.value = withTiming(300, {
        duration: ANIMATION_DURATION,
        easing: EASING,
      });
    }
  }, [visible, translateY]);

  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const sheetContent = (
    <Animated.View
      style={[
        styles.sheet,
        { backgroundColor: Theme["bg-primary"] },
        sheetAnimatedStyle,
      ]}
    >
      <Pressable
        onPress={(e) => e.stopPropagation()}
        style={styles.sheetContent}
      >
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <ThemedText
            fontSize={20}
            lineHeight={20}
            color="text-primary"
            style={styles.title}
          >
            {title}
          </ThemedText>
          <Button
            onPress={onClose}
            style={[
              styles.closeButton,
              { borderColor: Theme["border-secondary"] },
            ]}
          >
            <Image
              source={require("@/assets/images/close.png")}
              style={[styles.closeIcon, { tintColor: Theme["text-primary"] }]}
              tintColor={Theme["text-primary"]}
              cachePolicy="memory-disk"
            />
          </Button>
        </View>
        {children}
      </Pressable>
    </Animated.View>
  );

  return (
    <FramedModal visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        {Platform.OS === "web" ? (
          sheetContent
        ) : (
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardAvoid}
          >
            {sheetContent}
          </KeyboardAvoidingView>
        )}
      </Pressable>
    </FramedModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  keyboardAvoid: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: BorderRadius["8"],
    borderTopRightRadius: BorderRadius["8"],
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 4,
  },
  sheetContent: {
    padding: Spacing["spacing-5"],
    gap: Spacing["spacing-7"],
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerSpacer: {
    width: 38,
    height: 38,
  },
  title: {
    flex: 1,
    textAlign: "center",
    letterSpacing: -0.6,
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius["3"],
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  closeIcon: {
    width: 20,
    height: 20,
  },
});
