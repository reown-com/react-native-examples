import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { StyleSheet } from "react-native";

export default function PaymentTokenScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText>Payment Token</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
