import React from 'react';
import {Linking, ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native';
import {Button, FlexView, Text} from '@reown/appkit-ui-react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useSnapshot} from 'valtio';

import {RootStackParamList} from '@/utils/TypesUtil';
import {useTheme} from '@/hooks/useTheme';
import OmenStore from '@/stores/OmenStore';

import {buildOmenDepositUrl} from './depositUrl';

function formatUsd(n: number): string {
  const sign = n < 0 ? '-' : '';
  return `${sign}$${Math.abs(n)
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/, ',')}`;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
}

/**
 * Omen — a mock "funded account" host screen. Shows a balance + activity and opens the
 * WalletConnect Pay deposit flow in an in-app WebView (OmenDepositWebView), which credits the
 * balance from the result posted back over the RN bridge. No context switch, no redirect.
 */
function OmenScreen() {
  const Theme = useTheme();
  const {balance, activity} = useSnapshot(OmenStore.state);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const onDeposit = () => {
    navigation.navigate('OmenDepositWebView', {url: buildOmenDepositUrl()});
  };

  return (
    <ScrollView
      style={{backgroundColor: Theme['bg-100']}}
      contentContainerStyle={styles.content}>
      <FlexView alignItems="center" style={styles.balanceBlock}>
        <Text variant="small-400" style={{color: Theme['fg-200']}}>
          Account balance
        </Text>
        <Text variant="large-600" style={styles.balance}>
          {formatUsd(balance)}
        </Text>
      </FlexView>

      <View style={styles.actions}>
        <Button testID="omen-deposit-button" onPress={onDeposit}>
          + Deposit crypto
        </Button>
      </View>

      <Text variant="small-600" style={[styles.sectionLabel, {color: Theme['fg-200']}]}>
        Activity
      </Text>

      <View>
        {activity.map(tx => (
          <View
            key={tx.id}
            style={[styles.row, {borderBottomColor: Theme['gray-glass-010']}]}>
            <FlexView flexDirection="row" alignItems="center" style={styles.rowLeft}>
              <Text style={[styles.rowIcon, {color: Theme['fg-200']}]}>
                {tx.amount > 0 ? '↓' : '↑'}
              </Text>
              <FlexView style={styles.rowText}>
                <Text variant="small-600">{tx.label}</Text>
                <Text variant="small-400" style={{color: Theme['fg-250']}}>
                  {formatDate(tx.ts)}
                </Text>
                {tx.txHash ? (
                  <TouchableOpacity
                    onPress={() => Linking.openURL(`https://basescan.org/tx/${tx.txHash}`)}>
                    <Text variant="small-400" style={{color: Theme['accent-100']}}>
                      View on explorer
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </FlexView>
            </FlexView>
            <Text
              variant="small-600"
              style={{color: tx.amount > 0 ? Theme['success-100'] : Theme['fg-100']}}>
              {tx.amount > 0 ? '+' : ''}
              {formatUsd(tx.amount)}
            </Text>
          </View>
        ))}
      </View>

      <Text center variant="small-400" style={[styles.footer, {color: Theme['fg-250']}]}>
        Deposits powered by WalletConnect
      </Text>
    </ScrollView>
  );
}

export default OmenScreen;

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 24,
  },
  balanceBlock: {
    gap: 6,
    paddingVertical: 16,
  },
  balance: {
    fontSize: 42,
  },
  actions: {
    alignItems: 'center',
  },
  sectionLabel: {
    marginBottom: -8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLeft: {
    flex: 1,
    gap: 12,
  },
  rowIcon: {
    fontSize: 18,
    width: 24,
    textAlign: 'center',
  },
  rowText: {
    flex: 1,
  },
  footer: {
    marginTop: 8,
  },
});
