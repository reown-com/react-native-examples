import { Card } from "@/components/card";
import { CloseButton } from "@/components/close-button";
import { ThemedText } from "@/components/themed-text";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { resetNavigation } from "@/utils/navigation";
import { TOKEN_LIST, TokenKey } from "@/utils/networks";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, UnknownOutputParams, useLocalSearchParams } from "expo-router";
import { FlatList, StyleSheet, View } from "react-native";

interface ScreenParams extends UnknownOutputParams {
  amount: string;
}

export default function PaymentTokenScreen() {
  const Theme = useTheme();
  const { amount } = useLocalSearchParams<ScreenParams>();

  const handleTokenPress = (token: TokenKey) => {
    router.push({
      pathname: "/payment-network",
      params: {
        amount,
        token,
      },
    });
  };

  const handleOnClosePress = () => {
    resetNavigation("/amount");
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={TOKEN_LIST}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <Card style={styles.item} onPress={() => handleTokenPress(item.id)}>
            <ThemedText fontSize={16}>{item.symbol}</ThemedText>
            <Image
              source={item.icon}
              style={styles.image}
              cachePolicy="memory-disk"
              priority="high"
            />
          </Card>
        )}
      />
      <LinearGradient
        colors={[
          Theme["bg-primary"] + "00",
          Theme["bg-primary"] + "40",
          Theme["bg-primary"] + "CC",
          Theme["bg-primary"],
        ]}
        locations={[0, 0.3, 0.5, 1]}
        style={styles.gradient}
        pointerEvents="none"
      />
      <CloseButton style={styles.closeButton} onPress={handleOnClosePress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing["spacing-5"],
    justifyContent: "space-between",
    flex: 1,
  },
  listContainer: {
    gap: Spacing["spacing-3"],
    paddingHorizontal: Spacing["spacing-5"],
    paddingBottom: Spacing["extra-spacing-2"],
  },
  item: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing["spacing-6"],
    paddingVertical: Spacing["spacing-8"],
    borderRadius: BorderRadius["5"],
  },
  closeButton: {
    position: "absolute",
    alignSelf: "center",
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius["5"],
  },
  gradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
});
