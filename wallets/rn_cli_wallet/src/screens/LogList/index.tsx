import React, { useState, useMemo, useCallback } from 'react';
import { FlatList, StyleSheet, View, TouchableOpacity } from 'react-native';
import { useSnapshot } from 'valtio';

import { Log } from './components/Log';
import { AppLog } from './components/AppLog';
import { useTheme } from '@/hooks/useTheme';
import SettingsStore from '@/store/SettingsStore';
import LogStore, { LogEntry } from '@/store/LogStore';
import { Spacing, BorderRadius } from '@/utils/ThemeUtil';
import { Text } from '@/components/Text';

type LogSource = 'all' | 'app' | 'walletkit';

type CombinedLog =
  | { type: 'walletkit'; data: string; timestamp: number; id: string }
  | { type: 'app'; data: LogEntry; timestamp: number; id: string };

function FilterButton({
  label,
  value,
  selected,
  onPress,
}: {
  label: string;
  value: LogSource;
  selected: boolean;
  onPress: (value: LogSource) => void;
}) {
  const Theme = useTheme();

  return (
    <TouchableOpacity
      onPress={() => onPress(value)}
      style={[
        styles.filterButton,
        {
          backgroundColor: selected
            ? Theme['bg-accent-primary']
            : Theme['foreground-primary'],
        },
      ]}
    >
      <Text variant="sm-500" color={selected ? 'text-invert' : 'text-primary'}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export function LogList() {
  const Theme = useTheme();
  const { logs: walletKitLogs } = useSnapshot(SettingsStore.state);
  const { logs: appLogs } = useSnapshot(LogStore.state);
  const [source, setSource] = useState<LogSource>('all');

  const combinedLogs = useMemo(() => {
    const wkLogs: CombinedLog[] = walletKitLogs.map((log, index) => {
      let timestamp: number;
      try {
        const parsed = JSON.parse(log);
        timestamp = new Date(parsed.log?.time || parsed.timestamp).getTime();
      } catch {
        timestamp = Date.now();
      }
      return {
        type: 'walletkit' as const,
        data: log,
        timestamp,
        id: `wk-${index}`,
      };
    });

    const aLogs: CombinedLog[] = appLogs.map(log => ({
      type: 'app' as const,
      data: log,
      timestamp: log.timestamp,
      id: log.id,
    }));

    let filtered: CombinedLog[];
    switch (source) {
      case 'app':
        filtered = aLogs;
        break;
      case 'walletkit':
        filtered = wkLogs;
        break;
      default:
        filtered = [...wkLogs, ...aLogs];
    }

    return filtered.sort((a, b) => b.timestamp - a.timestamp);
  }, [walletKitLogs, appLogs, source]);

  const renderItem = useCallback(
    ({ item }: { item: CombinedLog }) =>
      item.type === 'app' ? (
        <AppLog entry={item.data} />
      ) : (
        <Log value={item.data} />
      ),
    [],
  );

  const keyExtractor = useCallback((item: CombinedLog) => item.id, []);

  return (
    <View style={[styles.container, { backgroundColor: Theme['bg-primary'] }]}>
      <View style={styles.filterContainer}>
        <FilterButton
          label="All"
          value="all"
          selected={source === 'all'}
          onPress={setSource}
        />
        <FilterButton
          label="App"
          value="app"
          selected={source === 'app'}
          onPress={setSource}
        />
        <FilterButton
          label="WalletKit"
          value="walletkit"
          selected={source === 'walletkit'}
          onPress={setSource}
        />
      </View>
      <FlatList
        data={combinedLogs}
        contentContainerStyle={styles.contentContainer}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    gap: Spacing[2],
  },
  filterButton: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    borderRadius: BorderRadius.full,
  },
  contentContainer: {
    paddingBottom: Spacing[8],
  },
});
