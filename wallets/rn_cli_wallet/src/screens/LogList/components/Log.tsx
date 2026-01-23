import React from 'react';
import { View, StyleSheet } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import Toast from 'react-native-toast-message';

import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/utils/ThemeUtil';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { ThemeKeys } from '@/utils/TypesUtil';

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

// WalletKit uses numeric log levels
type LogLevelName = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_MAP: Record<string, LogLevelName> = {
  '10': 'debug',
  '20': 'info',
  '30': 'warn',
  '40': 'error',
};

const LEVEL_COLORS: Record<LogLevelName, ThemeKeys> = {
  debug: 'text-tertiary',
  info: 'text-accent-primary',
  warn: 'text-warning',
  error: 'text-error',
};

export interface LogProps {
  value: string;
}

export function Log({ value }: LogProps) {
  const Theme = useTheme();

  // Parse with error handling to prevent crash on invalid JSON
  let jsonLog: Log;
  try {
    jsonLog = JSON.parse(value);
  } catch {
    // If parsing fails, render a fallback
    return (
      <Button
        onPress={() => {
          Clipboard.setString(value);
          Toast.show({ type: 'info', text1: 'Log copied to clipboard' });
        }}
        style={[
          styles.container,
          { backgroundColor: Theme['foreground-primary'] },
        ]}
      >
        <Text variant="sm-400" color="text-error">
          [PARSE ERROR]
        </Text>
        <Text variant="sm-400" color="text-secondary" style={styles.data}>
          {value}
        </Text>
      </Button>
    );
  }

  const { log } = jsonLog;

  const copyToClipboard = () => {
    Clipboard.setString(value);
    Toast.show({
      type: 'info',
      text1: 'Log copied to clipboard',
    });
  };

  const formatTime = (time: string) => {
    return new Date(time).toLocaleString();
  };

  const levelName = LEVEL_MAP[log.level] || 'info';
  const levelColor = LEVEL_COLORS[levelName];

  // Check if data has any meaningful content (not empty object)
  const hasData = log.data && Object.keys(log.data).length > 0;

  return (
    <Button
      onPress={copyToClipboard}
      style={[
        styles.container,
        { backgroundColor: Theme['foreground-primary'] },
      ]}
    >
      <View style={styles.header}>
        <Text variant="sm-500" color={levelColor}>
          [{levelName.toUpperCase()}]
        </Text>
        <Text variant="sm-400" color="text-secondary">
          {formatTime(log.time)}
        </Text>
      </View>

      <Text variant="sm-400" color="text-primary">
        {log.msg}
      </Text>

      {log.context && (
        <Text variant="sm-400" color="text-secondary" style={styles.context}>
          {log.context}
        </Text>
      )}

      {hasData && (
        <Text variant="sm-400" color="text-tertiary" style={styles.data}>
          {JSON.stringify(log.data)}
        </Text>
      )}
    </Button>
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
