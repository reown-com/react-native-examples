import React from 'react';
import {StyleSheet, StyleProp, ViewStyle, View} from 'react-native';
import {Icon, IconProps, Pressable, Text} from '@reown/appkit-ui-react-native';

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
  const backgroundColor = Theme['gray-glass-005'];

  return (
    <Pressable
      disabled={!onPress}
      style={[styles.container, {backgroundColor}, style]}
      bounceScale={0.98}
      onPress={onPress}>
      <View style={styles.textColumn}>
        <Text variant="small-600" style={{color: Theme['fg-100']}}>
          {title}
        </Text>
        {value && (
          <Text variant="small-500" style={{color: Theme['fg-150']}}>
            {value}
          </Text>
        )}
      </View>
      {icon && <Icon name={icon} size="sm" color={'fg-100'} />}
    </Pressable>
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
  // Bound the text column so long unbroken values (e.g. the did:key Client ID)
  // wrap within the card instead of overflowing. minWidth:0 lets the flex item
  // shrink below its content width on web (default is min-width:auto).
  textColumn: {
    flex: 1,
    minWidth: 0,
  },
});
