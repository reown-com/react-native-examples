import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Tag} from '../Tag';

interface IMethodsProps {
  methods: [] | [string] | undefined;
}

export function Methods({methods}: IMethodsProps) {
  return (
    <View style={styles.methodsContainer}>
      <Text style={styles.methodEventsTitle}>Methods</Text>
      <View style={styles.flexRowWrapped}>
        {methods?.length &&
          methods?.map((method: string, index: number) => (
            <Tag key={index} value={method} />
          ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  methodsContainer: {
    marginTop: 4,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 8,
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    marginBottom: 8,
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
