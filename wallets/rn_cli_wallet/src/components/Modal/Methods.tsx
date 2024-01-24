import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {Tag} from '../Tag';
import {useTheme} from '../../hooks/useTheme';

interface IMethodsProps {
  methods?: string[];
}

export function Methods({methods}: IMethodsProps) {
  const Theme = useTheme();
  return (
    <ScrollView
      bounces={false}
      style={[styles.container, {backgroundColor: Theme['bg-150']}]}
      contentContainerStyle={styles.content}>
      <Text style={[styles.title, {color: Theme['fg-150']}]}>Methods</Text>
      <View style={styles.row}>
        {methods?.length &&
          methods?.map((method: string, index: number) => (
            <Tag key={index} value={method} />
          ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 4,
    borderRadius: 20,
    marginBottom: 8,
    maxHeight: 120,
    width: '100%',
  },
  content: {
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    padding: 8,
  },
  title: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
    margin: 4,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
});
