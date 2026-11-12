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
      style={[
        styles.container,
        { backgroundColor: Theme["fill-warning-default"] },
      ]}
    >
      <View style={styles.label}>
        <Image
          source={require("@/assets/images/warning_circle.png")}
          style={styles.icon}
          tintColor={Theme["icon-warning-default"]}
          cachePolicy="memory-disk"
        />
        <ThemedText
          fontSize={14}
          lineHeight={18}
          color="content-default"
          style={styles.title}
        >
          Finish setting up
        </ThemedText>
      </View>
      <Badge
        label={`${remaining} Left`}
        backgroundColor="fill-warning-strong"
        color="content-warning-on-warning"
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
    borderRadius: BorderRadius["3"],
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
