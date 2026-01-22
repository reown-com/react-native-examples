import { useEffect, useCallback, useMemo } from 'react';
import { useSnapshot } from 'valtio';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';

import SettingsStore from '@/store/SettingsStore';
import WalletStore, { WalletAddresses } from '@/store/WalletStore';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/Text';
import { WalletConnectLoading } from '@/components/WalletConnectLoading';
import { Spacing } from '@/utils/ThemeUtil';
import { TokenBalance } from '@/utils/BalanceTypes';
import { TokenBalanceCard, ITEM_HEIGHT } from './components/TokenBalanceCard';

function getAddressForChain(
  chainId: string,
  addresses: WalletAddresses,
): string {
  if (chainId.startsWith('ton:')) {
    return addresses.tonAddress || '';
  }
  if (chainId.startsWith('tron:')) {
    return addresses.tronAddress || '';
  }
  // Default to EIP155 address for all EVM chains
  return addresses.eip155Address;
}

export default function Wallets() {
  const { eip155Address, tonAddress, tronAddress } = useSnapshot(
    SettingsStore.state,
  );
  const { balances, isLoading } = useSnapshot(WalletStore.state);
  const Theme = useTheme();

  const addresses: WalletAddresses = useMemo(
    () => ({
      eip155Address,
      tonAddress,
      tronAddress,
    }),
    [eip155Address, tonAddress, tronAddress],
  );

  const fetchBalances = useCallback(() => {
    if (addresses.eip155Address) {
      WalletStore.fetchBalances(addresses);
    }
  }, [addresses]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  const renderItem = useCallback(
    ({ item }: { item: TokenBalance }) => (
      <TokenBalanceCard
        balance={item}
        walletAddress={getAddressForChain(item.chainId, addresses)}
      />
    ),
    [addresses],
  );

  const keyExtractor = useCallback(
    (item: TokenBalance) => `${item.chainId}-${item.address || 'native'}`,
    [],
  );

  const getItemLayout = useCallback(
    (_data: ArrayLike<TokenBalance> | null | undefined, index: number) => ({
      length: ITEM_HEIGHT,
      offset: index * (ITEM_HEIGHT + Spacing[2]),
      index,
    }),
    [],
  );

  const ListEmptyComponent = useCallback(() => {
    if (!isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <WalletConnectLoading size={60} />
          <Text variant="lg-400" color="text-primary">
            Loading balance...
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text variant="lg-400" color="text-primary" style={styles.emptyText}>
          No balances found
        </Text>
      </View>
    );
  }, [isLoading]);

  return (
    <FlatList
      data={[]}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      ListEmptyComponent={ListEmptyComponent}
      contentInsetAdjustmentBehavior="automatic"
      style={[styles.container, { backgroundColor: Theme['bg-primary'] }]}
      contentContainerStyle={[
        styles.content,
        balances.length === 0 && styles.emptyContent,
      ]}
      refreshControl={
        <RefreshControl
          refreshing={isLoading && balances.length > 0}
          onRefresh={fetchBalances}
          tintColor={Theme['text-primary']}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing[5],
    rowGap: Spacing[2]
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing[10],
  },
  emptyText: {
    marginTop: Spacing[3],
  },
});
