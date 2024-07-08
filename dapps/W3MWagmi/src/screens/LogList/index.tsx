import React from 'react';
import {FlatList, SafeAreaView, StyleSheet} from 'react-native';
import {useCallback, useEffect, useState} from 'react';
import {useAccount} from 'wagmi';

import {Log} from './components/Log';
import {useTheme} from '@/hooks/useTheme';

export interface LogListProps {
  value: string;
}

export function LogList() {
  const Theme = useTheme();
  const {connector} = useAccount();
  const [provider, setProvider] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const getLogs = useCallback(async () => {
    if (provider) {
      const _logs =
        await provider.signer.client.core.logChunkController?.getLogArray();
      setLogs(_logs.reverse());
    }
  }, [provider]);

  useEffect(() => {
    const getProvider = async () => {
      if (connector && connector?.getProvider) {
        const _provider = await connector?.getProvider();
        setProvider(_provider);
      }
    };

    getProvider();
  }, [connector]);

  useEffect(() => {
    const interval = setInterval(() => {
      getLogs();
    }, 1000);

    return () => clearTimeout(interval);
  }, [getLogs]);

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
