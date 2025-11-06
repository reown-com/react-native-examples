import { Button } from "@/components/button";
import { CloseButton } from "@/components/close-button";
import { ThemedText } from "@/components/themed-text";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { TOKEN_LIST, TokenKey } from "@/utils/networks";
import { Image } from "expo-image";
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
    router.dismissAll();
    router.navigate("/amount");
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={TOKEN_LIST}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <Button
            style={[
              styles.item,
              { backgroundColor: Theme["foreground-primary"] },
            ]}
            onPress={() => handleTokenPress(item.id)}
          >
            <ThemedText fontSize={16}>{item.symbol}</ThemedText>
            <Image
              source={{ uri: item.icon }}
              style={styles.image}
              cachePolicy="memory-disk"
              priority="high"
            />
          </Button>
        )}
      />
      <CloseButton style={styles.closeButton} onPress={handleOnClosePress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing["spacing-5"],
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
  },
  listContainer: {
    gap: Spacing["spacing-3"],
    paddingHorizontal: Spacing["spacing-5"],
    paddingBottom: Spacing["extra-spacing-1"],
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
});
