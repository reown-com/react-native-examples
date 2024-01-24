import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {Tag} from '../Tag';
import {useTheme} from '../../hooks/useTheme';

interface IEventProps {
  events?: string[];
}

export function Events({events}: IEventProps) {
  const Theme = useTheme();
  return (
    <ScrollView
      bounces={false}
      style={[styles.container, {backgroundColor: Theme['bg-150']}]}
      contentContainerStyle={styles.content}>
      <Text style={[styles.title, {color: Theme['fg-150']}]}>Events</Text>
      <View style={styles.row}>
        {events?.map((event: string, index: number) => (
          <Tag key={index} value={event} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 8,
    marginBottom: 8,
    maxHeight: 120,
    width: '100%',
  },
  content: {
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  title: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
    margin: 4,
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
});
