import {
  Image,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import {BottomTabHeaderProps} from '@react-navigation/bottom-tabs';

import {Text} from '@/components/Text';
import {Avatar} from '@web3modal/ui-react-native';
import {Spacing} from '@/utils/ThemeUtil';
import Logo from '@/icons/w3i-logo.png';

interface Props extends BottomTabHeaderProps {
  address?: string;
  onAvatarPress: () => void;
  avatar?: string | null;
  style?: StyleProp<ViewStyle>;
}

export function TabHeader({
  options,
  address,
  onAvatarPress,
  avatar,
  style,
}: Props) {
  return (
    <View style={[styles.container, style]}>
      <Image source={Logo} style={styles.logo} resizeMode="center" />
      <Text variant="paragraph-600">{options.title}</Text>
      <TouchableOpacity onPress={onAvatarPress} activeOpacity={0.8}>
        <Avatar
          imageSrc={avatar ?? undefined}
          address={address}
          size={26}
          borderWidth={2}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: Spacing.l,
  },
  logo: {
    width: 26,
    height: 26,
  },
});
