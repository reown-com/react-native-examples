import React from 'react';
import {FlatList, SafeAreaView, StyleSheet} from 'react-native';

import {Log} from './components/Log';
import {useTheme} from '@/hooks/useTheme';
import {useSnapshot} from 'valtio';
import SettingsStore from '@/store/SettingsStore';

export interface LogListProps {
  value: string;
}

export function LogList() {
  const Theme = useTheme();
  const {logs} = useSnapshot(SettingsStore.state);

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: Theme['bg-100']}]}>
      <FlatList
        data={logs}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({item}) => <Log value={item} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
