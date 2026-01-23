import {
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';

import SvgClose from '@/assets/Close';
import { useTheme } from '@/hooks/useTheme';
import { BorderRadius, Spacing } from '@/utils/ThemeUtil';

interface ModalCloseButtonProps {
  onPress: () => void;
  showBorder?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function ModalCloseButton({
  onPress,
  showBorder = true,
  style,
}: ModalCloseButtonProps) {
  const Theme = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.closeButton,
        showBorder && { borderColor: Theme['border-secondary'] },
        showBorder && styles.closeButtonBorder,
        style,
      ]}
    >
      <SvgClose width={13} height={13} fill={Theme['text-primary']} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  closeButton: {
    borderRadius: BorderRadius[3],
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing[3],
  },
  closeButtonBorder: {
    borderWidth: 1,
  },
});
