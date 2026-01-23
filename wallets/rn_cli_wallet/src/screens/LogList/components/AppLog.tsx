import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import Toast from 'react-native-toast-message';

import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/utils/ThemeUtil';
import { Text } from '@/components/Text';
import { LogEntry, LogLevel } from '@/store/LogStore';
import { ThemeKeys } from '@/utils/TypesUtil';

const LEVEL_COLORS: Record<LogLevel, ThemeKeys> = {
  error: 'text-error',
  warn: 'text-warning',
  info: 'text-accent-primary',
  log: 'text-tertiary',
};

export interface AppLogProps {
  entry: LogEntry;
}

export function AppLog({ entry }: AppLogProps) {
  const Theme = useTheme();

  const copyToClipboard = () => {
    Clipboard.setString(JSON.stringify(entry, null, 2));
    Toast.show({
      type: 'info',
      text1: 'Log copied to clipboard',
    });
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const levelColor = LEVEL_COLORS[entry.level];

  return (
    <TouchableOpacity
      onPress={copyToClipboard}
      style={[
        styles.container,
        { backgroundColor: Theme['foreground-primary'] },
      ]}
    >
      <View style={styles.header}>
        <Text variant="sm-500" color={levelColor}>
          [{entry.level.toUpperCase()}]
        </Text>
        <Text variant="sm-400" color="text-secondary">
          {formatTime(entry.timestamp)}
        </Text>
      </View>

      <Text variant="sm-400" color="text-primary">
        {entry.message}
      </Text>

      {(entry.view || entry.functionName) && (
        <Text variant="sm-400" color="text-secondary" style={styles.context}>
          {[entry.view, entry.functionName].filter(Boolean).join(' > ')}
        </Text>
      )}

      {entry.data && Object.keys(entry.data).length > 0 && (
        <Text variant="sm-400" color="text-tertiary" style={styles.data}>
          {JSON.stringify(entry.data)}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius[4],
    marginVertical: Spacing['05'],
    marginHorizontal: Spacing[4],
    padding: Spacing[4],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing[1],
  },
  context: {
    marginTop: Spacing[1],
    fontStyle: 'italic',
  },
  data: {
    marginTop: Spacing[2],
    fontSize: 10,
  },
});
