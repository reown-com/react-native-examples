import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  View,
} from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { Icon, IconName } from '@/components/Icon';
import { Spacing, BorderRadius } from '@/utils/ThemeUtil';
import { Text } from '@/components/Text';

export interface CardProps {
  title: string;
  value?: string;
  onPress?: () => void;
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
}

export function Card({ title, value, onPress, icon, style }: CardProps) {
  const Theme = useTheme();
  const backgroundColor = Theme['foreground-primary'];

  return (
    <TouchableOpacity
      disabled={!onPress}
      style={[styles.container, { backgroundColor }, style]}
      onPress={onPress}
    >
      <View>
        <Text variant="md-500" color="text-primary">
          {title}
        </Text>
        {value && (
          <Text variant="md-400" color="text-secondary">
            {value}
          </Text>
        )}
      </View>
      {icon && <Icon name={icon} size="sm" color="text-primary" />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius[4],
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[4],
    rowGap: Spacing[1],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
