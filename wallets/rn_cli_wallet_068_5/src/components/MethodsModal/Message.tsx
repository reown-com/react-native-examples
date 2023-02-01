import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';

interface IMessageProps {
  message: string;
}

export function Message({message}: IMessageProps) {
  return (
    <View style={styles.methodsContainer}>
      <Text style={styles.methodEventsTitle}>Message</Text>
      <ScrollView
        showsVerticalScrollIndicator
        contentContainerStyle={styles.messageContainer}>
        <Text style={styles.messageText}>{message}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  messageContainer: {
    maxHeight: 200,
  },
  methodsContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 8,
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  messageText: {
    fontWeight: '500',
    paddingHorizontal: 6,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.21,
    color: '#585F5F',
  },
  methodEventsTitle: {
    color: 'rgba(121, 134, 134, 1)',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    paddingLeft: 6,
    paddingVertical: 4,
  },
  flexRowWrapped: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
});
