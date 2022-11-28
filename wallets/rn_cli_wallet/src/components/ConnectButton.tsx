import {
  TouchableOpacity,
  StyleSheet,
  Text,
  StyleProp,
  ViewStyle,
} from 'react-native';
import {useTheme} from '@/hooks/useTheme';

interface IConnectButtonProps {
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function ConnectButton({onPress, disabled, style}: IConnectButtonProps) {
  const Theme = useTheme();
  const backgroundColor = disabled ? Theme['fg-300'] : Theme['accent-100'];
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[styles.container, {backgroundColor}, style]}>
      <Text style={styles.mainText}>Connect</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    height: 46,
    marginTop: 16,
  },
  mainText: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '600',
    color: 'white',
  },
});
