import React from 'react';
import {Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useTheme} from '@/hooks/useTheme';

export interface CardProps {
  title: string;
  value: string;
  onPress?: () => void;
}

export function Card({title, value, onPress}: CardProps) {
  const Theme = useTheme();
  const backgroundColor = Theme['bg-175'];

  return (
    <TouchableOpacity
      disabled={!onPress}
      style={[styles.container, {backgroundColor}]}
      onPress={onPress}>
      <Text style={[styles.title, {color: Theme['fg-100']}]}>{title}</Text>
      <Text style={[styles.value, {color: Theme['fg-150']}]}>{value}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 10,
    rowGap: 4,
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
