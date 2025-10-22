import { StyleSheet } from "react-native";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";
import { IconSymbol } from "./ui/icon-symbol";

interface Props {
  isCompleted: boolean;
  isError: boolean;
  text: string;
}



export default function PaymentStep({ isCompleted, isError, text }: Props) {
  return (
    <ThemedView style={styles.statusStep}>
      <IconSymbol name={isCompleted ? 'checkmark.circle.fill' : isError ? 'xmark.circle.fill' : 'clock'} size={20} color={isCompleted ? "#28A745" : isError ? "#DC3545" : "#007BFF"} />
      <ThemedText style={[styles.text, { color: isCompleted ? "#28A745" : isError ? "#DC3545" : "#007BFF" }]}>{text}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  statusStep: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  text: {
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '500',
  },
});