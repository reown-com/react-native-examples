import { ThemedText } from "@/components/themed-text";
import { StyleSheet, View } from "react-native";

export default function SettingsScanAddress() {
  return (
    <View style={StyleSheet.absoluteFill}>
      <View style={styles.container}>
        <ThemedText>Camera not available</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    alignSelf: "center",
  },
});
