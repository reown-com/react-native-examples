import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import Toast from 'react-native-toast-message';

import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/Text';
import { Spacing, BorderRadius } from '@/utils/ThemeUtil';
import CopySvg from '@/assets/Copy';
import { TokenBalance } from '@/utils/BalanceTypes';
import { PresetsUtil } from '@/utils/PresetsUtil';
import { haptics } from '@/utils/haptics';

export const ITEM_HEIGHT = 86;

interface TokenBalanceCardProps {
  balance: TokenBalance;
  walletAddress: string;
}

function truncateAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatBalance(numeric: string, symbol: string): string {
  const num = parseFloat(numeric);
  if (num === 0) return `0 ${symbol}`;
  if (num < 0.0001) return `<0.0001 ${symbol}`;
  if (num < 1) return `${num.toFixed(4)} ${symbol}`;
  if (num < 1000) return `${num.toFixed(2)} ${symbol}`;
  return `${num.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })} ${symbol}`;
}

export const TokenBalanceCard = React.memo(function TokenBalanceCard({
  balance,
  walletAddress,
}: TokenBalanceCardProps) {
  const Theme = useTheme();

  // Get chain data and icon from PresetsUtil
  const chainData = PresetsUtil.getChainDataById(balance.chainId);
  const chainIcon = PresetsUtil.getChainIconById(balance.chainId);
  const chainName = chainData?.name || balance.name;

  const copyToClipboard = () => {
    Clipboard.setString(walletAddress);
    haptics.copyAddress();
    Toast.show({
      type: 'info',
      text1: `${chainName} address copied`,
    });
  };

  return (
    <TouchableOpacity
      onPress={copyToClipboard}
      style={[styles.card, { backgroundColor: Theme['foreground-primary'] }]}
    >
      <View style={styles.iconContainer}>
        {/* Token icon */}
        {balance.iconUrl ? (
          <Image
            source={{ uri: balance.iconUrl, cache: 'force-cache' }}
            style={[styles.tokenIcon, { backgroundColor: Theme['bg-invert'] }]}
            resizeMode="contain"
          />
        ) : chainIcon ? (
          <Image
            source={chainIcon}
            style={styles.tokenIcon}
            resizeMode="contain"
          />
        ) : (
          <View
            style={[
              styles.tokenIcon,
              styles.placeholderIcon,
              { backgroundColor: Theme['foreground-tertiary'] },
            ]}
          />
        )}
        {/* Chain badge */}
        {chainIcon && balance.iconUrl && (
          <View
            style={[
              styles.chainBadge,
              { backgroundColor: Theme['bg-primary'] },
            ]}
          >
            <Image
              source={chainIcon}
              style={styles.chainBadgeIcon}
              resizeMode="contain"
            />
          </View>
        )}
      </View>
      <View style={styles.cardContent}>
        <Text variant="lg-400" color="text-primary">
          {formatBalance(balance.quantity.numeric, balance.symbol)}
        </Text>
        <Text variant="lg-400" color="text-secondary">
          {truncateAddress(walletAddress)}
        </Text>
      </View>
      <View style={styles.copyButton}>
        <CopySvg width={20} height={20} fill={Theme['text-primary']} />
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius[4],
    paddingHorizontal: Spacing[6],
    height: ITEM_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 38,
    height: 38,
    marginRight: Spacing[3],
    position: 'relative',
  },
  tokenIcon: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.full,
  },
  placeholderIcon: {
    borderRadius: BorderRadius.full,
  },
  chainBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  chainBadgeIcon: {
    width: 14,
    height: 14,
    borderRadius: BorderRadius.full,
  },
  cardContent: {
    flex: 1,
    gap: Spacing['05'],
  },
  copyButton: {
    padding: Spacing[2],
  },
});
