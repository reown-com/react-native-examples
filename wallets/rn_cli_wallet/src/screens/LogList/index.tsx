import React from 'react';
import { FlatList, StyleSheet } from 'react-native';

import { Log } from './components/Log';
import { useTheme } from '@/hooks/useTheme';
import { useSnapshot } from 'valtio';
import SettingsStore from '@/store/SettingsStore';
import { Spacing } from '@/utils/ThemeUtil';

export interface LogListProps {
  value: string;
}

export function LogList() {
  const Theme = useTheme();
  const { logs } = useSnapshot(SettingsStore.state);

  return (
    <FlatList
      data={logs}
      style={[styles.container, { backgroundColor: Theme['bg-primary'] }]}
      contentContainerStyle={styles.contentContainer}
      keyExtractor={(_, index) => index.toString()}
      renderItem={({ item }) => <Log value={item} />}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing[2],
  },
  contentContainer: {
    paddingBottom: Spacing[8],
  },
});
