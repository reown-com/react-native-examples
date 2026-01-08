import React from 'react';
import {View, StyleSheet, TouchableOpacity, Alert, Text} from 'react-native';
import {useTheme} from '@/hooks/useTheme';
import Clipboard from '@react-native-clipboard/clipboard';

type Log = {
  timestamp: string;
  log: {
    time: string;
    level: string;
    context: string;
    msg: string;
    type?: string; // 'event' | 'method'
    event?: string;
    method?: string;
    data: object;
    subscription?: {
      topic: string;
      relay: {protocol: 'string'};
      id: string;
    };
  };
};

export interface LogProps {
  value: string;
}

export function Log({value}: LogProps) {
  const Theme = useTheme();
  const jsonLog: Log = JSON.parse(value);

  const copyToClipboard = (_value: string) => {
    Clipboard.setString(_value);
    Alert.alert('Value copied to clipboard');
  };

  return (
    <TouchableOpacity
      key={jsonLog.timestamp}
      onPress={() => copyToClipboard(value)}
      style={[styles.container, {backgroundColor: Theme['bg-300']}]}>
      {Object.keys(jsonLog.log).map(key => {
        const item = jsonLog.log[key as keyof typeof jsonLog.log];
        return (
          <View key={key}>
            <Text style={styles.text}>
              {key}: <Text style={styles.textSmall}>{formatValue(key, item)}</Text>
            </Text>
          </View>
        );
      })}
    </TouchableOpacity>
  );
}

const formatValue = (key: any, value: any) => {
  if (key === 'time') {
    return new Date(value).toLocaleString();
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return value;
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    marginVertical: 2,
    marginHorizontal: 16,
    padding: 16,
  },
  text: {
    fontSize: 12,
    lineHeight: 18,
  },
  textSmall: {
    fontSize: 10,
    lineHeight: 16,
  },
});
