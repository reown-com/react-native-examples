import React from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import Clipboard from '@react-native-clipboard/clipboard';
import { Spacing, BorderRadius } from '@/utils/ThemeUtil';
import { Text } from '@/components/Text';

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
      relay: { protocol: 'string' };
      id: string;
    };
  };
};

export interface LogProps {
  value: string;
}

export function Log({ value }: LogProps) {
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
      style={[
        styles.container,
        { backgroundColor: Theme['foreground-tertiary'] },
      ]}
    >
      {Object.keys(jsonLog.log).map(key => {
        const item = jsonLog.log[key as keyof typeof jsonLog.log];
        return (
          <View key={key}>
            <Text variant="sm-400" color="text-primary">
              {key}:{' '}
              <Text
                variant="sm-400"
                color="text-secondary"
                style={styles.textSmall}
              >
                {formatValue(key, item)}
              </Text>
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
    borderRadius: BorderRadius[5],
    marginVertical: Spacing['05'],
    marginHorizontal: Spacing[4],
    padding: Spacing[4],
  },
  textSmall: {
    fontSize: 10,
  },
});
