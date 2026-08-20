import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { useAssets } from "expo-asset";
import { Image } from "expo-image";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { ThemedText } from "./themed-text";

type ToastType = "error" | "info" | "success" | "warning" | "loading";

interface ToastProps {
  message?: string;
  type: ToastType;
}

const LOADING_COLOR = "#0988F0";

export function Toast({ message = "", type }: ToastProps) {
  const Theme = useTheme();
  const [assets] = useAssets([
    require("@/assets/images/toast-info.png"),
    require("@/assets/images/toast-warning.png"),
    require("@/assets/images/toast-error.png"),
    require("@/assets/images/toast-success.png"),
  ]);

  const icon = {
    info: assets?.[0],
    warning: assets?.[1],
    error: assets?.[2],
    success: assets?.[3],
    loading: undefined,
  }[type];

  return (
    <View style={[styles.container, { backgroundColor: Theme["bg-invert"] }]}>
      <ThemedText
        color="text-invert"
        fontSize={16}
        lineHeight={18}
        style={styles.label}
      >
        {message}
      </ThemedText>

      <View style={styles.icon}>
        {type === "loading" ? (
          <ActivityIndicator size="small" color={LOADING_COLOR} />
        ) : (
          <Image source={icon} style={styles.iconImage} contentFit="contain" />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    maxWidth: "90%",
    gap: Spacing["spacing-9"],
    paddingLeft: Spacing["spacing-6"],
    paddingRight: 10,
    paddingVertical: 10,
    borderRadius: BorderRadius["13"],
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  label: {
    flexShrink: 1,
  },
  icon: {
    height: 28,
    width: 28,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  iconImage: {
    height: 28,
    width: 28,
  },
});
