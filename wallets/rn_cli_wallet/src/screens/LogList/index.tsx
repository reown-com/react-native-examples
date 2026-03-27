import React, { useState, useMemo, useCallback } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useSnapshot } from 'valtio';
import Toast from 'react-native-toast-message';

import { WalletKitLog } from './components/WalletKitLog';
import { AppLog } from './components/AppLog';
import {
  LogFilterSheet,
  getFilterLabel,
  type LogSource,
} from './components/LogFilterSheet';
import { useTheme } from '@/hooks/useTheme';
import SettingsStore from '@/store/SettingsStore';
import LogStore, { LogEntry } from '@/store/LogStore';
import { Spacing, BorderRadius } from '@/utils/ThemeUtil';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import SvgCaretUpDown from '@/assets/CaretUpDown';

type CombinedLog =
  | { type: 'walletkit'; data: string; timestamp: number; id: string }
  | { type: 'app'; data: LogEntry; timestamp: number; id: string };

export function LogList() {
  const Theme = useTheme();
  const { logs: walletKitLogs } = useSnapshot(SettingsStore.state);
  const { logs: appLogs } = useSnapshot(LogStore.state);
  const [source, setSource] = useState<LogSource>('app');
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);

  const combinedLogs = useMemo(() => {
    const wkLogs: CombinedLog[] = walletKitLogs.map((log, index) => {
      let timestamp: number;
      try {
        const parsed = JSON.parse(log);
        const parsedTime = new Date(
          parsed.log?.time || parsed.timestamp,
        ).getTime();
        if (isNaN(parsedTime)) {
          throw new Error('Invalid date');
        }
        timestamp = parsedTime;
      } catch {
        timestamp = Date.now() - (walletKitLogs.length - index);
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
        <WalletKitLog value={item.data} />
      ),
    [],
  );

  const keyExtractor = useCallback((item: CombinedLog) => item.id, []);

  const handleSelectFilter = useCallback((value: LogSource) => {
    setSource(value);
    setFilterSheetVisible(false);
  }, []);

  const handleClearLogs = useCallback(() => {
    LogStore.clearLogs();
    Toast.show({
      type: 'info',
      text1: 'App logs cleared',
    });
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: Theme['bg-primary'] }]}>
      <View style={styles.toolbar}>
        <Button
          onPress={() => setFilterSheetVisible(true)}
          style={[
            styles.filterDropdown,
            { backgroundColor: Theme['foreground-primary'] },
          ]}
        >
          <Text variant="md-400" color="text-primary">
            {getFilterLabel(source)}
          </Text>
          <SvgCaretUpDown
            width={14}
            height={14}
            fill={Theme['text-secondary']}
          />
        </Button>
        <Button onPress={handleClearLogs} style={styles.clearButton}>
          <Text variant="md-400" color="text-secondary">
            Clear App logs
          </Text>
        </Button>
      </View>
      <FlatList
        data={combinedLogs}
        contentContainerStyle={[
          styles.contentContainer,
          combinedLogs.length === 0 && styles.emptyContentContainer,
        ]}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="h6-400" color="text-primary">
              No logs yet
            </Text>
            <Text variant="lg-400" color="text-secondary" center>
              Logs will appear here as you use the app.
            </Text>
          </View>
        }
      />
      <LogFilterSheet
        visible={filterSheetVisible}
        selected={source}
        onSelect={handleSelectFilter}
        onClose={() => setFilterSheetVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
  },
  filterDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderRadius: BorderRadius[3],
  },
  clearButton: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
  },
  contentContainer: {
    paddingBottom: Spacing[8],
  },
  emptyContentContainer: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    gap: Spacing[2],
    justifyContent: 'center',
    alignItems: 'center',
  },
});
