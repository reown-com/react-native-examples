import React, {useMemo, useState} from 'react';
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';

import {ToastUtils} from '@/utils/ToastUtils';

import type {DebugEntry, DebugLevel} from './useWebViewDebugLog';

const LEVEL_COLOR: Record<DebugLevel, string> = {
  nav: '#8b5cf6',
  open: '#38bdf8',
  msg: '#a1a1aa',
  console: '#e4e4e7',
  error: '#f87171',
};

function timeOf(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number, len = 2) => String(n).padStart(len, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(
    d.getMilliseconds(),
    3,
  )}`;
}

interface Props {
  entries: DebugEntry[];
  onClear: () => void;
}

/**
 * Developer-facing debug overlay for the deposit WebView. A floating pill (bottom-right) that
 * expands into a scrollable log of navigations / handler verdicts / forwarded BX console lines,
 * so we can root-cause the wallet-open handoff on-device without a JS console. Copy dumps the
 * whole log to the clipboard.
 */
function WebViewDebugOverlay({entries, onClear}: Props) {
  const [open, setOpen] = useState(false);

  const asText = useMemo(
    () =>
      entries
        .map(e => `${timeOf(e.ts)} [${e.level}] ${e.label}${e.detail ? `\n    ${e.detail}` : ''}`)
        .join('\n'),
    [entries],
  );

  const onCopy = () => {
    Clipboard.setString(asText);
    ToastUtils.showInfoToast('Debug log copied', `${entries.length} entries`);
  };

  if (!open) {
    return (
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
        testID="omen-debug-fab">
        <Text style={styles.fabText}>🐞 {entries.length}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.panel} pointerEvents="box-none">
      <View style={styles.panelInner}>
        <View style={styles.toolbar}>
          <Text style={styles.title}>Deposit debug · {entries.length}</Text>
          <View style={styles.toolbarActions}>
            <TouchableOpacity onPress={onCopy} style={styles.btn}>
              <Text style={styles.btnText}>Copy</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClear} style={styles.btn}>
              <Text style={styles.btnText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setOpen(false)} style={styles.btn}>
              <Text style={styles.btnText}>Hide</Text>
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
          {entries.length === 0 ? (
            <Text style={styles.empty}>No events yet — tap a wallet.</Text>
          ) : (
            entries.map(e => (
              <View key={e.id} style={styles.entry}>
                <Text style={styles.entryHead}>
                  <Text style={styles.time}>{timeOf(e.ts)} </Text>
                  <Text style={{color: LEVEL_COLOR[e.level]}}>[{e.level}] </Text>
                  <Text style={styles.label}>{e.label}</Text>
                </Text>
                {e.detail ? <Text style={styles.detail}>{e.detail}</Text> : null}
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
}

export default WebViewDebugOverlay;

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 12,
    bottom: 24,
    backgroundColor: 'rgba(24,24,27,0.92)',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#3f3f46',
  },
  fabText: {
    color: '#f4f4f5',
    fontSize: 13,
    fontWeight: '600',
  },
  panel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '55%',
  },
  panelInner: {
    flex: 1,
    backgroundColor: 'rgba(9,9,11,0.96)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#3f3f46',
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#27272a',
  },
  title: {
    color: '#f4f4f5',
    fontSize: 13,
    fontWeight: '600',
  },
  toolbarActions: {
    flexDirection: 'row',
    gap: 8,
  },
  btn: {
    backgroundColor: '#27272a',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  btnText: {
    color: '#e4e4e7',
    fontSize: 12,
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 12,
    gap: 8,
  },
  empty: {
    color: '#71717a',
    fontSize: 12,
  },
  entry: {
    gap: 2,
  },
  entryHead: {
    fontSize: 11,
  },
  time: {
    color: '#52525b',
  },
  label: {
    color: '#f4f4f5',
    fontWeight: '600',
  },
  detail: {
    color: '#a1a1aa',
    fontSize: 11,
    fontFamily: 'Courier',
    paddingLeft: 8,
  },
});
