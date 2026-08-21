import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";
import { Badge } from "./badge";
import { ThemedText } from "./themed-text";

interface SetupBannerProps {
  remaining: number;
  testID?: string;
}

export function SetupBanner({ remaining, testID }: SetupBannerProps) {
  const Theme = useTheme();

  return (
    <View
      testID={testID}
      style={[styles.container, { backgroundColor: Theme["bg-warning"] }]}
    >
      <View style={styles.label}>
        <Image
          source={require("@/assets/images/warning_circle.png")}
          style={styles.icon}
          tintColor={Theme["icon-warning"]}
          cachePolicy="memory-disk"
        />
        <ThemedText
          fontSize={14}
          lineHeight={18}
          color="text-primary"
          style={styles.title}
        >
          Finish setting up
        </ThemedText>
      </View>
      <Badge
        label={`${remaining} Left`}
        backgroundColor="icon-warning"
        color="text-white"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 54,
    paddingHorizontal: Spacing["spacing-5"],
    borderRadius: BorderRadius["4"],
    gap: Spacing["spacing-2"],
  },
  label: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing["spacing-2"],
  },
  icon: {
    width: 18,
    height: 18,
  },
  title: {
    fontWeight: "500",
  },
});
