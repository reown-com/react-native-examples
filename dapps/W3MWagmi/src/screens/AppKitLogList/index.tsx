import React from 'react';
import {Alert, FlatList, Pressable, SafeAreaView, StyleSheet, Text} from 'react-native';
import { useAppKitLogs } from '@reown/appkit-react-native';
import Clipboard from '@react-native-clipboard/clipboard';

import {useTheme} from '@/hooks/useTheme';

export function AppKitLogList() {
  const Theme = useTheme();
  const { logs } = useAppKitLogs();

  const copyToClipboard = (_value: string) => {
    Clipboard.setString(_value);
    Alert.alert('Value copied to clipboard');
  };

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: Theme['bg-100']}]}>
      <FlatList
        data={logs}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={styles.contentContainer}
        renderItem={({item}) => <Pressable onPress={() => copyToClipboard(JSON.stringify(item))}><Text style={[styles.text, styles[item.level]]}>{`[${item.level}] ${item.fileName}:${item.functionName} ${item.message}`}</Text></Pressable>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 8,
  },
  text: {
    marginVertical: 4,
  },
  error: {
    color: 'red',
  },
  warn: {
    color: 'yellow',
  },
  info: {
    color: 'blue',
  },
  debug: {
    color: 'green',
  },
});
