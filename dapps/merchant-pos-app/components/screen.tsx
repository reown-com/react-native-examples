import { useTheme } from "@/hooks/use-theme-color";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import { Edge, SafeAreaView } from "react-native-safe-area-context";

interface Props {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  edges?: Edge[];
}

/** Full-bleed themed screen container with safe-area padding. */
export function Screen({ children, style, edges = ["top", "bottom"] }: Props) {
  const Theme = useTheme();
  return (
    <SafeAreaView
      edges={edges}
      style={[styles.root, { backgroundColor: Theme["bg-primary"] }, style]}
    >
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
