import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "./themed-text";

interface Props {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

/** Bottom-anchored modal sheet with a backdrop and grab handle. */
export function BottomSheet({ visible, onClose, title, children }: Props) {
  const Theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.sheet,
            {
              backgroundColor: Theme["foreground-primary"],
              borderColor: Theme["border-primary"],
              paddingBottom: insets.bottom + Spacing["spacing-6"],
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View
            style={[
              styles.handle,
              { backgroundColor: Theme["border-secondary"] },
            ]}
          />
          {title ? (
            <ThemedText weight="500" style={styles.title}>
              {title}
            </ThemedText>
          ) : null}
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: BorderRadius["7"],
    borderTopRightRadius: BorderRadius["7"],
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing["spacing-6"],
    paddingTop: Spacing["spacing-3"],
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 99,
    alignSelf: "center",
    marginBottom: Spacing["spacing-5"],
  },
  title: {
    fontSize: 17,
    marginBottom: Spacing["spacing-4"],
  },
});
