import React from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  View,
} from 'react-native';
import {Icon, IconProps} from '@reown/appkit-ui-react-native';

import {useTheme} from '@/hooks/useTheme';

export interface CardProps {
  title: string;
  value?: string;
  onPress?: () => void;
  icon?: IconProps['name'];
  style?: StyleProp<ViewStyle>;
}

export function Card({title, value, onPress, icon, style}: CardProps) {
  const Theme = useTheme();
  const backgroundColor = Theme['bg-175'];

  return (
    <TouchableOpacity
      disabled={!onPress}
      style={[styles.container, {backgroundColor}, style]}
      onPress={onPress}>
      <View>
        <Text style={[styles.title, {color: Theme['fg-100']}]}>{title}</Text>
        {value && (
          <Text style={[styles.value, {color: Theme['fg-150']}]}>{value}</Text>
        )}
      </View>
      {icon && <Icon name={icon} size="sm" color={'fg-100'} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    rowGap: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
  },
});
