import { PrimaryButton } from "@/components/primary-button";
import { Screen } from "@/components/screen";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

const COPY: Record<string, { title: string; body: string }> = {
  cancelled: {
    title: "Payment cancelled",
    body: "The payment request was cancelled before it was completed.",
  },
  expired: {
    title: "Payment expired",
    body: "The payment request expired before it was paid. Try again.",
  },
  failed: {
    title: "Payment failed",
    body: "Something went wrong with the payment. Please try again.",
  },
};

export default function CancelledScreen() {
  const Theme = useTheme();
  const { reason } = useLocalSearchParams<{ reason?: string }>();
  const copy = COPY[reason ?? "cancelled"] ?? COPY.cancelled;

  return (
    <Screen>
      <View style={styles.content}>
        <View
          style={[
            styles.icon,
            { backgroundColor: Theme["foreground-secondary"] },
          ]}
        >
          <Svg width={44} height={44} viewBox="0 0 40 40" fill="none">
            <Circle
              cx={20}
              cy={20}
              r={20}
              fill={Theme["foreground-tertiary"]}
            />
            <Path
              d="M13 13l14 14M27 13L13 27"
              stroke={Theme["text-secondary"]}
              strokeWidth={3}
              strokeLinecap="round"
            />
          </Svg>
        </View>
        <ThemedText weight="500" style={styles.title}>
          {copy.title}
        </ThemedText>
        <ThemedText color="text-secondary" style={styles.body}>
          {copy.body}
        </ThemedText>
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          label="Try again"
          onPress={() => router.replace("/pos/amount")}
        />
        <PrimaryButton
          label="Back to home"
          variant="secondary"
          onPress={() => router.replace("/home")}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing["spacing-8"],
  },
  icon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing["spacing-5"],
  },
  title: {
    fontSize: 22,
    marginBottom: Spacing["spacing-2"],
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  footer: {
    paddingHorizontal: Spacing["spacing-6"],
    paddingBottom: Spacing["spacing-4"],
    gap: Spacing["spacing-3"],
  },
});
